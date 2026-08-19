import './VSMapBoard.css'
import { ReactFlow, Background, Controls, applyEdgeChanges, applyNodeChanges, addEdge, MiniMap, BackgroundVariant } from "@xyflow/react";
import { useParams } from 'react-router';
import { useState, useEffect, useCallback } from 'react';
import TableNode from './TableNode';
import Axios from 'axios';
import '@xyflow/react/dist/style.css'
import SupplyNode from './SupplyNode';
import CustomerNode from './CustomerNode';

function VSMapBoard(props) {
    const { id } = useParams();
    const [vsMap, setVsMap] = useState();
    const [title, setTitle] = useState();
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await Axios.get(`http://localhost:8080/vsm/${id}`);
                const processTables = response.data?.value_stream_map?.process_tables || {};
                const supply = response.data?.value_stream_map?.supply;
                const customer_output = response.data?.value_stream_map.customer_output;
                setTitle(title => response.data?.value_stream_map?.title)
                console.log(customer_output);

                // Transform processTables into nodes
                const tableNodes = Object.entries(processTables).map(([key, table], index) => ({
                    id: table.id || key,
                    type: 'table',
                    position: { x: index === 0 ? 1 * 350 : index * 350 + 350 , y: 450 }, // Space nodes horizontally
                    data: {
                        title: table.title,
                        items: table.rows?.map(row => ({
                            name: row.row_name,
                            value: row.value,
                            unit: row.unit
                        }))
                    }
                }));


                const supplierNode = supply ? [{
                    id: supply.id,
                    type: 'supply',  
                    position: { x: 0, y: 0 },
                    data: {
                        supply: supply 
                    }
                }] : [];

                const customerNode = customer_output ? [{
                    id: customer_output.id,
                    type: 'customer',  
                    position: { x: Object.entries(processTables).length * 350 + 350, y: 0 },
                    data: {
                        customer_output: customer_output 
                    }
                }] : [];

                console.log(customerNode);

                const edgesToSet = [];

                Object.entries(processTables).map(([key, table], index) => {
                    if (index <= Object.entries(processTables).length - 2) {
                        var edge = {
                            id: `${table.id}:${Object.entries(processTables).at(index).at(1)?.id}`,
                            source: `${Object.entries(processTables).at(index + 1).at(1)?.id}`,
                            target: `${table.id}`,
                            label: `${table.inventory?.amount} ${table.inventory?.unit}`
                        }
                        edgesToSet.push(edge);
                    }
                    if(table.position === 1){
                        var edgeToSupply = {
                            id: `${supply.id}:${table.id}`,
                            source: `${table.id}`,
                            target: `${supply.id}`,
                            label: `${supply.amount} ${supply.unit}`
                        }
                        edgesToSet.push(edgeToSupply);
                    }

                    if(table.position === Object.entries(processTables).length){
                        var edgeToCustomer = {
                            id: `${table.id}:${customer_output.id}`,
                            source: `${customer_output.id}`,
                            target: `${table.id}`,
                            label: `${table.inventory?.amount} ${table?.inventory.unit}`
                        }
                        edgesToSet.push(edgeToCustomer);
                    }
                });

                supplierNode


                setNodes(nodes => [...tableNodes, ...supplierNode, ...customerNode]);
                setEdges(edgesToSet);
            } catch (err) {
                console.error('Error:', err);
            }
        };

        fetchData();
    }, [id]);



    async function fetchVSData(id) {
        try {
            const response = await Axios.get(`http://localhost:8080/vsm/${id}`);
            setVsMap(response.data.value_stream_map)
            return response;
        }
        catch (err) {
            console.log(err);
        }
    }

    const onNodesChange = useCallback(
        (changes) => {
            setNodes(nodes => applyNodeChanges(changes, nodes));
        },
        [],
    );

    const onEdgesChange = useCallback(
        (changes) => {
            setEdges(edges => applyEdgeChanges(changes, edges));
        },
        [edges],
    );

    const nodeTypes = {
        table: TableNode,
        supply: SupplyNode,
        customer: CustomerNode,
    }

    return (
        <div className="vs-map">
            <div className="flow-panel">
                <h2>{title}</h2>

                <div className="flow-basics">
                    <ReactFlow
                        edges={edges}
                        nodes={nodes}
                        nodeTypes={nodeTypes}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                    >
                        <Background
                            color="#beaadd"
                            bgColor="#FFFFFF"
                            size="2"
                            variant={BackgroundVariant.Dots}
                        />
                        <Controls />
                        <MiniMap />
                    </ReactFlow>
                </div>
            </div>

            <div className="work-panel">
                <h2 className="work-panel-title">Work Panel</h2>

                <div className="work-panel-section">
                    <h3>Process Table</h3>
                    <div className="work-panel-option">
                        <input type="checkbox" id="table1" />
                        <label htmlFor="table1">Table 1</label>
                    </div>
                    <div className="work-panel-option">
                        <input type="checkbox" id="table2" />
                        <label htmlFor="table2">Table 2</label>
                    </div>
                    <button className="work-panel-button">Add Node</button>
                </div>

                <div className="work-panel-section">
                    <h3>Client</h3>
                    <div className="work-panel-option">
                        <input type="checkbox" id="client1" />
                        <label htmlFor="client1">Client A</label>
                    </div>
                    <div className="work-panel-option">
                        <input type="checkbox" id="client2" />
                        <label htmlFor="client2">Client B</label>
                    </div>
                    <button className="work-panel-button">Add Node</button>
                </div>

                <div className="work-panel-section">
                    <h3>Inventory</h3>
                    <div className="work-panel-option">
                        <input type="checkbox" id="inv1" />
                        <label htmlFor="inv1">Inventory 1</label>
                    </div>
                    <div className="work-panel-option">
                        <input type="checkbox" id="inv2" />
                        <label htmlFor="inv2">Inventory 2</label>
                    </div>
                    <button className="work-panel-button">Add Node</button>
                    <button className="work-panel-button">Add Edge</button>
                </div>
            </div>
        </div>
    );
}

export default VSMapBoard;