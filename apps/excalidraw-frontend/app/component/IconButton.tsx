import { ReactNode } from "react";

export function IconButton({
    icon, onClick, activated
}: {
    icon: ReactNode,
    onClick: () => void,
    activated: boolean
}) {
    return <div className={`m-2 pointer rounded-full border p-2 bg-black hover:bg-gray text-white"}`} onClick={onClick} style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "50%" }}>
        <span style={{ color: activated ? "red" : "white", fontSize: "24px" }}>{icon}</span>
    </div>
}
