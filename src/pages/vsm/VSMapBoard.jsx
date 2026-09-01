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
import ProductionControlNode from './nodes/production-control/ProductionControlNode';
import { v4 } from 'uuid';

function VSMapBoard(props) {
    const { id } = useParams();
    const { t } = useTranslation();
    const [vsMap, setVsMap] = useState();
    const [title, setTitle] = useState();
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [pTables, setpTables] = useState([]);


    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleInput, setTitleInput] = useState('');
    const [titleError, setTitleError] = useState('');
    const [isSavingTitle, setIsSavingTitle] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await Axios.get(`http://localhost:8080/vsm/${id}`);
                setVsMap(response.data?.value_stream_map);
                const processTables = response.data?.value_stream_map?.process_tables ?? [];
                const supply = response.data?.value_stream_map?.supply;
                const customer_output = response.data?.value_stream_map.customer_output;
                const TABLE_NODE_DISTANCE = 400;
                const TRUCK_NODE_Y = 400;
                const valueStreamMap = response.data?.value_stream_map;
                setTitle(title => valueStreamMap.title);
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
                        label: `${table?.inventory.amount} ${getUnitDisplayName(valueStreamMap.unit.unit_type)}`
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

                const customerNode = customer_output ? {
                    id: customer_output.id,
                    type: 'customer',
                    position: { x: Object.entries(processTables).length * TABLE_NODE_DISTANCE + TABLE_NODE_DISTANCE, y: 0 },
                    data: {
                        customer_output: customer_output
                    }
                } : {};

                const productionControlNode = {
                    id: v4(),
                    type: 'productionControl',
                    position: {
                        x: (supplierNode.position.x + customerNode.position.x) / 2,
                        y: -150
                    },
                    data: {
                        rows: [
                            {
                                id: "someId",
                                row_name: "Production Control"
                            }
                        ]
                    }
                };



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

                const edgeFromProdControlToSupplier = {
                    id: `prodControl:${supply.id}`,
                    source: `${supply.id}`,
                    target: `${productionControlNode.id}`,
                    label: t("production-control-card.weekly-order")
                }

                edgesToSet.push(edgeFromProdControlToSupplier);

                const edgeFromProdControlToCustomer = {
                    id: `${customerNode.id}:prodControl`,
                    source: `${productionControlNode.id}`,
                    target: `${customerNode.id}`,
                    label: t("production-control-card.monthly-order")
                }

                edgesToSet.push(edgeFromProdControlToCustomer);



                Object.entries(processTables).filter(([key, table], index) => {
                    if (table.position === 1) {
                        const edgeToSupply = {
                            id: `${supply.id}:${table.id}`,
                            source: `${table.id}`,
                            target: `${supply.id}`,
                            label: `${supply.amount} ${getUnitDisplayName(valueStreamMap.unit.unit_type)}`
                        }
                        edgesToSet.push(edgeToSupply);
                    }
                    if (table.position === Object.entries(processTables).length) {
                        const edgeToCustomer = {
                            id: `${table.id}:${customer_output.id}`,
                            source: `${customer_output.id}`,
                            target: `${table.id}`,
                            label: `${table.inventory?.amount} ${getUnitDisplayName(valueStreamMap.unit.unit_type)}`
                        }
                        edgesToSet.push(edgeToCustomer);
                    }
                });


                setNodes(nodes => [...tableNodes, customerNode, ...inventoryNodesToSet, ...truckNodes, supplierNode, productionControlNode]);
                setEdges(edges => [...edgesToSet]);
            } catch (err) {
                console.error('Error:', err);
            }
        };

        fetchData();
    }, [id]);

    const handleEditTitle = () => {
        setTitleInput(title || '');
        setTitleError('');
        setIsEditingTitle(true);
    };

    const handleCancelTitleEdit = () => {
        setTitleInput(title || '');
        setTitleError('');
        setIsEditingTitle(false);
    };

    const handleSaveTitle = async () => {
        const newTitle = titleInput.trim();

        // Validation
        if (!newTitle) {
            setTitleError('Title cannot be empty.');
            return;
        }

        if (newTitle.length > 255) {
            setTitleError('Title cannot exceed 255 characters.');
            return;
        }

        setIsSavingTitle(true);
        setTitleError('');

        try {
            const response = await Axios.put(
                `http://localhost:8080/vsm/${id}`,
                null,
                {
                    params: {
                        title: newTitle
                    }
                }
            );

            /*
             * The backend returns the complete VSM object.
             */
            const updatedVsm = response.data?.value_stream_map;

            /*
             * Update the React state with the object
             * returned from the backend.
             */
            setVsMap(updatedVsm);
            setTitle(updatedVsm.title);

            /*
             * Exit editing mode.
             */
            setIsEditingTitle(false);

        } catch (err) {
            console.error('Failed to update VSM title:', err);

            setTitleError(
                err.response?.data ||
                'Failed to update title.'
            );
        } finally {
            setIsSavingTitle(false);
        }
    };

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


    const nodeTypes = {
        table: TableNode,
        supply: SupplyNode,
        customer: CustomerNode,
        inventory: InventoryNode,
        truck: TruckNode,
        productionControl: ProductionControlNode
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

                    <div className="vsm-title-container">

                        {!isEditingTitle ? (
                            <>
                                <h2>{title}</h2>

                                <button
                                    type="button"
                                    onClick={handleEditTitle}
                                    className="vsm-title-edit-button"
                                >
                                    {t("common.change")}
                                </button>
                            </>
                        ) : (
                            <>
                                <input
                                    type="text"
                                    value={titleInput}
                                    onChange={(e) => {
                                        setTitleInput(e.target.value);
                                        setTitleError('');
                                    }}
                                    className="vsm-title-input"
                                    disabled={isSavingTitle}
                                    autoFocus
                                />

                                <button
                                    type="button"
                                    onClick={handleSaveTitle}
                                    className="vsm-title-save-button"
                                    disabled={isSavingTitle}
                                >
                                    {isSavingTitle
                                        ? (t("common.saving") || "Saving...")
                                        : (t("common.save") || "Save")}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleCancelTitleEdit}
                                    className="vsm-title-cancel-button"
                                    disabled={isSavingTitle}
                                >
                                    {t("common.cancel") || "Cancel"}
                                </button>

                                {titleError && (
                                    <div className="vsm-title-error">
                                        {titleError}
                                    </div>
                                )}
                            </>
                        )}

                    </div>


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
                <WorkPanel processTables={pTables} unitId={vsMap.unit.id} vsmId={vsMap.id} supply={vsMap.supply} customerOutput={vsMap.customer_output} />
            </div>
        );
    }


}

export default VSMapBoard;