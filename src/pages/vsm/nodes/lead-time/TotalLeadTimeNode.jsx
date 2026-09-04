import { Handle, Position } from "@xyflow/react";
import "./TotalLeadTimeNode.css";

function TotalLeadTimeNode({ data }) {
   console.log(data)
    const {
        totalLeadTime,
        processTables = [],
        inventoryNodes = [],
        tableNodeDistance = 400,
    } = data;

    const elementPositions = new Map();
    const inventories = data?.inventories;

    processTables.forEach((node) => {
        elementPositions.set(node.id, node.position);
    });

    inventories.forEach((node) => {
        elementPositions.set(node.id, node.position);
    });

    if (!totalLeadTime?.lead_times?.length) {
        return null;
    }

    const leadTimes = [...totalLeadTime.lead_times].sort(
        (a, b) => a.position - b.position
    );
    

    

    /*
     * The line is positioned relative to the first process table.
     *
     * We use the actual process/inventory node positions supplied
     * by the VSM generation rather than trying to recreate them here.
     */
    const allNodes = [
        ...processTables,
        ...inventoryNodes,
    ];

    console.log(inventoryNodes);

    const nodeXs = allNodes
        .map(node => node?.position?.x)
        .filter(x => Number.isFinite(x));

    const minX = nodeXs.length > 0 ? Math.min(...nodeXs) : 0;
    const maxX = nodeXs.length > 0 ? Math.max(...nodeXs) : tableNodeDistance;

    const width = Math.max(
        maxX - minX + tableNodeDistance,
        tableNodeDistance
    );

    const PROCESS_Y = 100;
    const INVENTORY_Y = PROCESS_Y + 50;
    /*
     * Find the X position corresponding to a lead-time element.
     *
     * position 1 -> customer inventory
     * position 2 -> first process table
     * position 3 -> next inventory
     * position 4 -> next process table
     * ...
     *
     * The final element is takt time and belongs to the supply side.
     */
    const getX = (leadTime) => {
        const position = leadTime.position;

        if (position === 1) {
            const customerInventory = inventoryNodes.find(
                node => node.id === "customer_inventory"
            );

            return customerInventory
                ? customerInventory.position.x - minX
                : 0;
        }

        if (position === leadTimes.length) {
            const supplyInventory = inventoryNodes.find(
                node => node.id === "supply_inventory"
            );

            return supplyInventory
                ? supplyInventory.position.x - minX
                : width;
        }

        /*
         * Even positions represent process tables.
         *
         * position 2 -> process table 0
         * position 4 -> process table 1
         * position 6 -> process table 2
         * ...
         */
        if (position % 2 === 0) {
            const tableIndex = position / 2 - 1;
            const table = processTables[tableIndex];

            return table
                ? table.position.x - minX
                : 0;
        }

        /*
         * Odd positions represent inventories.
         *
         * position 3 -> inventory 0
         * position 5 -> inventory 1
         * ...
         */
        const inventoryIndex = (position - 3) / 2;
        const inventory = inventoryNodes[inventoryIndex];

        return inventory
            ? inventory.position.x - minX
            : 0;
    };

    const points = [...totalLeadTime.lead_times]
        .sort((a, b) => a.position - b.position)
        .map((leadTime, index, leadTimes) => {

            // First lead time → always supply inventory
            if (index === 0) {
                return {
                    x: supplyInventory.position.x,
                    value: leadTime.value,
                    position: leadTime.position,
                    isInventory: true,
                    matchingElement: supplyInventory.id
                };
            }

            // Last lead time → don't display
            if (index === leadTimes.length - 1) {
                return null;
            }

            // Normal lead-time mapping
            const nodePosition = elementPositions.get(
                leadTime.matching_element
            );

            if (!nodePosition) {
                return null;
            }

            return {
                x: nodePosition.x,
                value: leadTime.value,
                position: leadTime.position,
                isInventory: leadTime.position % 2 === 1,
                matchingElement: leadTime.matching_element
            };
        })
        .filter(Boolean);
        console.log(points);

    return (
        <div
            className="total-lead-time-node"
            style={{
                width: `${width}px`,
                height: "180px",
            }}
        >
            <Handle
                type="target"
                position={Position.Top}
                style={{ visibility: "hidden" }}
            />

            <svg
                className="total-lead-time-svg"
                width={width}
                height="180"
                viewBox={`0 0 ${width} 180`}
            >
                <path
                    d={path}
                    className="total-lead-time-line"
                    fill="none"
                />

                {points.map(point => (
                    <g key={point.id}>
                        <circle
                            cx={point.x}
                            cy={point.y}
                            r="4"
                            className="total-lead-time-point"
                        />

                        <text
                            x={point.x}
                            y={point.y - 12}
                            textAnchor="middle"
                            className="total-lead-time-value"
                        >
                            {point.value}
                        </text>
                    </g>
                ))}

                <text
                    x={width / 2}
                    y="160"
                    textAnchor="middle"
                    className="total-lead-time-label"
                >
                    Total Lead Time: {totalLeadTime.lead_time}
                </text>

                <text
                    x={width / 2}
                    y="178"
                    textAnchor="middle"
                    className="total-lead-time-value-added"
                >
                    Value Added: {totalLeadTime.value_added}
                </text>
            </svg>
        </div>
    );
}

export default TotalLeadTimeNode;