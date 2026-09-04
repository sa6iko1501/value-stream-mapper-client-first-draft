import { useNodes } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import "./TotalLeadTimeNode.css";

/*
 * A lead time ladder is the stepped ("sawtooth") timeline that runs along
 * the bottom of a value stream map. It has two rungs:
 *
 *   - the upper rung carries the waiting time and sits under an
 *     inventory triangle,
 *   - the lower rung carries the processing time and is dropped down
 *     under a process table.
 *
 * Every rung is therefore anchored to the horizontal centre of the map
 * element it belongs to, and two neighbouring rungs meet halfway between
 * the centres of their elements.
 */

/*
 * Only used until React Flow has measured a node for the first time.
 */
const FALLBACK_SIZES = {
    table: { width: 200, height: 150 },
    inventory: { width: 80, height: 75 }
};

const GAP_BELOW_MAP = 48;        /* map bottom            -> top of the ladder */
const WAIT_LABEL_BAND = 24;      /* top of the ladder     -> upper rung        */
const RUNG_DROP = 44;            /* upper rung            -> lower rung        */
const PROCESS_LABEL_BAND = 26;   /* lower rung            -> its labels        */
const TOTALS_GAP = 28;           /* process labels        -> the totals        */
const LADDER_OVERHANG = 20;      /* outer elements        -> ladder ends       */

/*
 * React Flow positions a node by its top-left corner, so the width and
 * the height are needed for every element the ladder has to line up
 * with. The measured size is the real one; the node snapshot handed over
 * by the board has none yet, hence the fallbacks above.
 */
function readGeometry(node) {
    if (!node?.position) {
        return null;
    }

    const fallback = FALLBACK_SIZES[node.type] ?? FALLBACK_SIZES.table;

    return {
        id: node.id,
        type: node.type,
        x: node.position.x,
        y: node.position.y,
        width: node.measured?.width ?? node.width ?? fallback.width,
        height: node.measured?.height ?? node.height ?? fallback.height
    };
}

function centreOf(element) {
    return element.x + element.width / 2;
}

function bottomOf(element) {
    return element.y + element.height;
}

function formatValue(value) {
    if (value === null || value === undefined) {
        return "";
    }

    const numeric = Number(value);

    if (!Number.isFinite(numeric)) {
        return `${value}`;
    }

    return `${Math.round(numeric * 100) / 100}`;
}

function TotalLeadTimeNode({ id, data, positionAbsoluteX, positionAbsoluteY }) {
    const nodes = useNodes();
    const {t} = useTranslation();

    const totalLeadTime = data?.totalLeadTime;

    /*
     * The board hands over a snapshot of the nodes it generated. The live
     * store is preferred - it is the only place that carries the measured
     * sizes and it keeps the ladder aligned while nodes are dragged - but
     * the snapshot keeps the ladder correct on the very first render.
     */
    const elements = new Map();

    [
        ...(data?.processTables ?? []),
        ...(data?.inventories ?? data?.inventoryNodes ?? []),
        ...nodes
    ]
        .filter(node => node?.type === "table" || node?.type === "inventory")
        .forEach(node => {
            const geometry = readGeometry(node);

            if (geometry) {
                elements.set(geometry.id, geometry);
            }
        });

    const leadTimes = [...(totalLeadTime?.lead_times ?? [])].sort(
        (a, b) => (a.position ?? 0) - (b.position ?? 0)
    );

    if (leadTimes.length === 0 || elements.size === 0) {
        return null;
    }

    /*
     * Every lead time but the first and the last one points at its map
     * element by UUID.
     */
    const middleElements = leadTimes
        .slice(1, -1)
        .map(leadTime => elements.get(leadTime.matching_element))
        .filter(Boolean);

    /*
     * The first and the last lead time belong to the supply and to the
     * customer inventory, which the board generates on the fly and which
     * therefore have no UUID to be matched against. They are found by
     * elimination: they are the two inventories no lead time points at.
     */
    const referenced = new Set(
        leadTimes.map(leadTime => leadTime.matching_element).filter(Boolean)
    );

    const endpoints = [...elements.values()]
        .filter(element => element.type === "inventory" && !referenced.has(element.id))
        .sort((a, b) => centreOf(a) - centreOf(b));

    /*
     * Positions normally ascend from the supply towards the customer, but
     * the direction is taken from the map itself rather than assumed.
     */
    const runsLeftToRight =
        middleElements.length < 2 ||
        centreOf(middleElements[0]) <= centreOf(middleElements[middleElements.length - 1]);

    const firstElement = endpoints.length
        ? (runsLeftToRight ? endpoints[0] : endpoints[endpoints.length - 1])
        : null;

    const lastElement = endpoints.length > 1
        ? (runsLeftToRight ? endpoints[endpoints.length - 1] : endpoints[0])
        : null;


    const rungs = leadTimes
        .map((leadTime, index) => {
            let element;

            if (index === 0) {
                element = firstElement;
            }
            else if (index === leadTimes.length - 1) {
                element = lastElement;
            }
            else {
                element = elements.get(leadTime.matching_element);
            }

            return element ? { leadTime, element } : null;
        })
        .filter(Boolean)
        .sort((a, b) => centreOf(a.element) - centreOf(b.element));

    if (rungs.length === 0) {
        return null;
    }

    const first = rungs[0];
    const last = rungs[rungs.length - 1];
    last.leadTime=leadTimes[leadTimes.length - 2];

    /*
     * Where one rung ends and the next begins: halfway between the two
     * element centres. The outer ends stick out past the first and the
     * last element by a fixed overhang.
     */
    const boundaries = [
        centreOf(first.element) - first.element.width / 2 - LADDER_OVERHANG,
        ...rungs.slice(1).map(
            (rung, index) => (centreOf(rungs[index].element) + centreOf(rung.element)) / 2
        ),
        centreOf(last.element) + last.element.width / 2 + LADDER_OVERHANG
    ];

    /*
     * The board places this node at a fixed spot, which says nothing
     * about how tall the process tables turned out to be. All vertical
     * offsets are therefore measured from the lowest point of the map and
     * translated into the node's own coordinate space.
     */
    const originX = Number.isFinite(positionAbsoluteX)
        ? positionAbsoluteX
        : (nodes.find(node => node.id === id)?.position?.x ?? 0);

    const originY = Number.isFinite(positionAbsoluteY)
        ? positionAbsoluteY
        : (nodes.find(node => node.id === id)?.position?.y ?? 0);

    const mapBottom = Math.max(...rungs.map(rung => bottomOf(rung.element)));

    const ladderTop = Math.max(0, mapBottom + GAP_BELOW_MAP - originY);

    const waitY = ladderTop + WAIT_LABEL_BAND;
    const processY = waitY + RUNG_DROP;
    const totalsY = processY + PROCESS_LABEL_BAND + TOTALS_GAP;
    const valueAddedY = totalsY + 20;
    const valueAddedRatioY = totalsY + 40;

    const height = valueAddedY + 12;

    const isWaiting = rung => rung.element.type === "inventory";
    const rungY = rung => (isWaiting(rung) ? waitY : processY);

    /*
     * A single stepped path: horizontal along each rung, vertical at
     * every boundary in between.
     */
    let path = `M ${boundaries[0]} ${rungY(first)}`;

    rungs.forEach((rung, index) => {
        const y = rungY(rung);

        if (index > 0) {
            path += ` L ${boundaries[index]} ${y}`;
        }

        path += ` L ${boundaries[index + 1]} ${y}`;
    });

    /*
     * The SVG is drawn in flow coordinates - that is what keeps it lined
     * up with the map - so the viewBox is shifted to the left end of the
     * ladder and the element itself is offset by the same amount.
     */
    const left = boundaries[0];
    const width = boundaries[boundaries.length - 1] - left;
    const centre = left + width / 2;

    return (
        <div
            className="total-lead-time-node"
            style={{
                width: `${Math.max(0, left - originX) + width}px`,
                height: `${height}px`
            }}
        >
            <svg
                className="total-lead-time-svg"
                style={{ left: `${left - originX}px` }}
                width={width}
                height={height}
                viewBox={`${left} 0 ${width} ${height}`}
            >
                {rungs.map(rung => (
                    <line
                        key={`connector-${rung.element.id}`}
                        className="total-lead-time-connector"
                        x1={centreOf(rung.element)}
                        y1={bottomOf(rung.element) - originY}
                        x2={centreOf(rung.element)}
                        y2={rungY(rung)}
                    />
                ))}

                <path
                    d={path}
                    className="total-lead-time-line"
                    fill="none"
                />

                {rungs.map(rung => (
                    <text
                        key={`value-${rung.element.id}`}
                        x={centreOf(rung.element)}
                        y={isWaiting(rung) ? waitY - 9 : processY + 19}
                        textAnchor="middle"
                        className={
                            isWaiting(rung)
                                ? "total-lead-time-wait-value"
                                : "total-lead-time-process-value"
                        }
                    >
                        {formatValue(rung.leadTime.value)}
                    </text>
                ))}

                <text
                    x={centre}
                    y={totalsY}
                    textAnchor="middle"
                    className="total-lead-time-label"
                >
                    {`Total Lead Time: ${formatValue(totalLeadTime.lead_time)} ${t("units.second")}`}
                </text>

                <text
                    x={centre}
                    y={valueAddedY}
                    textAnchor="middle"
                    className="total-lead-time-value-added"
                >
                    {`Value Added: ${formatValue(totalLeadTime.value_added)} ${t("units.second")}`}
                </text>

                <text
                    x={centre}
                    y={valueAddedRatioY}
                    textAnchor="middle"
                    className="total-lead-time-value-added"
                >
                    {`Value Added Ratio: ${formatValue(totalLeadTime.value_added_ratio)}%`}
                </text>
            </svg>
        </div>
    );
}

export default TotalLeadTimeNode;
