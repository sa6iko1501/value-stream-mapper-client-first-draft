import './VSMapBoard.css'
import { ReactFlow, Background, Controls, applyEdgeChanges, applyNodeChanges, addEdge, MiniMap, BackgroundVariant } from "@xyflow/react";
import { useParams } from 'react-router';
import { useState, useEffect, useCallback } from 'react';
import TableNode from './nodes/TableNode';
import Axios from 'axios';
import '@xyflow/react/dist/style.css'
import SupplyNode from './nodes/supply/SupplyNode';
import CustomerNode from './nodes/customer/CustomerNode';
import InventoryNode from './nodes/inventory/InventoryNode';
import TruckNode from './nodes/TruckNode';

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
                setVsMap(vsMap => response.data?.value_stream_map);
                const processTables = response.data?.value_stream_map?.process_tables || {};
                const supply = response.data?.value_stream_map?.supply;
                const customer_output = response.data?.value_stream_map.customer_output;
                const TABLE_NODE_DISTANCE = 400;
                const TRUCK_NODE_Y = 400;
                setTitle(title => response.data?.value_stream_map?.title)
                // Transform processTables into nodes
                const tableNodes = Object.entries(processTables).map(([key, table], index) => ({
                    id: table.id || key,
                    type: 'table',
                    position: { x: index === 0 ? 1 * TABLE_NODE_DISTANCE : index * TABLE_NODE_DISTANCE + TABLE_NODE_DISTANCE, y: 450 }, // Space nodes horizontally
                    data: {
                        title: table.title,
                        items: table.rows?.map(row => ({
                            name: row.row_name,
                            value: row.value,
                            unit: row.unit
                        }))
                    }
                }));

                const MAGIC_NUMBER = 125;

                const inventoryPositions = tableNodes.slice(0, -1).map((table, index) => {
                    const nextTable = tableNodes[index + 1];
                    const midX = (table.position.x + nextTable.position.x + MAGIC_NUMBER) / 2;
                    return { x: midX, y: table.position.y };
                });

                const allInventoryNodes = Object.entries(processTables).slice(0, -1).map(([key, table], index) => ({
                    id: table?.inventory.id || key,
                    type: 'inventory',
                    ownTable: `${table.id}`,
                    nextInLine: table?.inventory?.nextInLine ? `${table?.inventory.nextInLine}` : null,
                    unit: table?.inventory.unit,
                    amount: table?.inventory.amount,
                    position: inventoryPositions[index],
                    data: {
                        label: `${table?.inventory.amount} ${table?.inventory.unit}`
                    }
                }));

                const inventoryNodesToSet = (allInventoryNodes || []).filter(
                    inventory => inventory && inventory.nextInLine !== null
                );



                const supplierNode = {
                    id: supply.id,
                    type: 'supply',
                    position: { x: 0, y: 0 },
                    data: {
                        supply: supply
                    }
                };

                const truckNodes = [];

                const supplyTruck = {
                    id: `${supply.id}:truck`,
                    type: 'truck',
                    position: {
                        x: TABLE_NODE_DISTANCE - MAGIC_NUMBER,
                        y: TRUCK_NODE_Y
                    }
                }
                truckNodes.push(supplyTruck);

                const customerTruck = {
                    id: `${tableNodes.at(tableNodes.length -1).id}:truck`,
                    type: 'truck',
                    position:{
                        x: tableNodes.at(tableNodes.length -1).position.x + TABLE_NODE_DISTANCE - MAGIC_NUMBER,
                        y: TRUCK_NODE_Y
                    }
                }
                truckNodes.push(customerTruck);

                console.log(tableNodes.at(tableNodes.length -1).position);

                const customerNode = customer_output ? [{
                    id: customer_output.id,
                    type: 'customer',
                    position: { x: Object.entries(processTables).length * TABLE_NODE_DISTANCE + TABLE_NODE_DISTANCE, y: 0 },
                    data: {
                        customer_output: customer_output
                    }
                }] : [];


                const edgesToSet = [];

                inventoryNodesToSet.forEach(inventory => {
                    var edgeLeft = {
                        id: `${inventory.ownTable}:${inventory.id}`,
                        source: `${inventory.id}`,
                        target: `${inventory.ownTable}`
                    }
                    edgesToSet.push(edgeLeft);
                    var edgeRight = {
                        id: `${inventory.id}:${inventory.nextInLine}`,
                        source: `${inventory.nextInLine}`,
                        target: `${inventory.id}`
                    }
                    edgesToSet.push(edgeRight);
                })

                Object.entries(processTables).filter(([key, table], index) => {
                    if (table.position === 1) {
                        console.log(table);
                        const edgeToSupply = {
                            id: `${supply.id}:${table.id}`,
                            source: `${table.id}`,
                            target: `${supply.id}`,
                            label: `${supply.amount} ${supply.unit}`
                        }
                        edgesToSet.push(edgeToSupply);
                    }
                    if (table.position === Object.entries(processTables).length) {
                        const edgeToCustomer = {
                            id: `${table.id}:${customer_output.id}`,
                            source: `${customer_output.id}`,
                            target: `${table.id}`,
                            label: `${table.inventory?.amount} ${table?.inventory.unit}`
                        }
                        edgesToSet.push(edgeToCustomer);
                    }
                });


                setNodes(nodes => [...tableNodes, ...customerNode, ...inventoryNodesToSet, ...truckNodes, supplierNode]);
                setEdges(edges => [...edgesToSet]);
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
        inventory: InventoryNode,
        truck: TruckNode
    }

    return (
        <div className="vs-map">
            <div className="flow-panel">
                <h2>{title}</h2>

                <div className="flow-basics">
                    <ReactFlow
                        edges={edges}
                        nodes={nodes}
                        key={`${nodes.length}-${edges.length}`}
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