import './VSMapBoard.css'
import { ReactFlow, Background, Controls, applyEdgeChanges, applyNodeChanges, addEdge, MiniMap, BackgroundVariant } from "@xyflow/react";
import { useParams } from 'react-router';
import { useState, useEffect, useCallback } from 'react';
import TableNode from './TableNode';
import  Axios  from 'axios';
import '@xyflow/react/dist/style.css'

function VSMapBoard(props){
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
                setTitle(title => response.data?.value_stream_map?.title)

                // Transform processTables into nodes
                const tableNodes = Object.entries(processTables).map(([key, table], index) => ({
                    id: table.id || key,
                    type: 'table',
                    position: { x: index * 350, y: 100 }, // Space nodes horizontally
                    data: {
                        title: table.title,
                        items: table.rows?.map(row => ({
                            name: row.row_name,
                            value: row.value,
                            unit: row.unit
                        }))
                    }
                }));

                const edgesToSet = [];

                Object.entries(processTables).map(([key, table], index) => {
                    
                    if(index <= Object.entries(processTables).length - 2){
                        var edge = {
                            id: `${table.id}:${Object.entries(processTables).at(index).at(1)?.id}`, 
                            source: `${Object.entries(processTables).at(index + 1).at(1)?.id}`, 
                            target: `${table.id}`,
                            label: `${table.inventory?.amount} ${table.inventory?.unit}`
                        }
                        edgesToSet.push(edge);
                    }
                });
                setNodes(tableNodes);
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
        table: TableNode
    }

    return(
        <div className="vs-map">
            <h2>{title}</h2>
            <div className="flow-basics" style={{ height: '75vh', width: '70vw' }}>
            <ReactFlow
                edges={edges}
                nodes={nodes}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
            >
                <Background color="#beaadd" bgColor="#FFFFFF" size="2" variant={BackgroundVariant.Dots}/>
                <Controls />
                <MiniMap />
            </ReactFlow>
            </div>
        </div>
    );
}

export default VSMapBoard;