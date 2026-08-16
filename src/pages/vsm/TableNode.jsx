import { Handle, Position } from "@xyflow/react";
import './TableNode.css'

function TableNode({ data }) {

    return (
        <div className="table-node">
            <label className="table-node-title">
                {data.title}
            </label>
                <table className="table-node-table">
                    <tbody>
                        {data.items?.map((item, index) => (
                            <tr key={index}>
                                <td>{item.name}</td>
                                <td>{`${item.value} ${item.unit}`}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Handle type="source" id="top-handle" position={Position.Left}/>
                <Handle type="target" id="bottom-handle" position={Position.Right}/>
        </div>
    );
}

export default TableNode;