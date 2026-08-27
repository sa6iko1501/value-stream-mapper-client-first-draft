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
import { useTranslation } from "react-i18next";
import WorkPanel from './work-panel/WorkPanel';

function VSMapBoard(props) {
    const { id } = useParams();
    const { t } = useTranslation();
    const [vsMap, setVsMap] = useState();
    const [title, setTitle] = useState();
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [pTables, setpTables] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await Axios.get(`http://localhost:8080/vsm/${id}`);
                setVsMap(vsMap => response.data?.value_stream_map);
                const processTables = response.data?.value_stream_map?.process_tables ?? [];
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
                            unit: getUnitDisplayName(row.unit.unit_type)
                        }))
                    }
                }));

                setpTables(processTables);

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
                    id: `${tableNodes.at(tableNodes.length - 1).id}:truck`,
                    type: 'truck',
                    position: {
                        x: tableNodes.at(tableNodes.length - 1).position.x + TABLE_NODE_DISTANCE - MAGIC_NUMBER,
                        y: TRUCK_NODE_Y
                    }
                }
                truckNodes.push(customerTruck);

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

    const getUnitDisplayName = (unitType) => {
        switch (unitType) {
            case "KG": {
                return t("units.kg");
            }
            case "PIECE": {
                return t("units.piece");
            }
            case "PALLET": {
                return t("units.pallet");
            }
            case "CART": {
                return t("units.cart");
            }
            case "HOUR": {
                return t("units.hour");
            }
            case "NUMBER": {
                return "";
            }
            case "DAY": {
                return t("units.day");
            }
            case "SECOND": {
                return t("units.second");
            }
            case "PERCENT": {
                return "%";
            }
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

    const handleProcessTablesChange = (updatedTables) => {
        setpTables(updatedTables);
    }

    const nodeTypes = {
        table: TableNode,
        supply: SupplyNode,
        customer: CustomerNode,
        inventory: InventoryNode,
        truck: TruckNode
    }

    if (vsMap === undefined) {
        return (
            <div className="vs-map">
                <div className="flow-panel">
                    <h2>{t("common.loading") || "Loading..."}</h2>
                </div>
            </div>
        );
    }
    else {
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
                <WorkPanel processTables={pTables} unitId={vsMap.unit.id} vsmId={vsMap.id} />
            </div>
        );
    }


}

export default VSMapBoard;