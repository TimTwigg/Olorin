import { Dialog } from "primereact/dialog";

export type ModalType = undefined | "info" | "confirm";

export type ModalProps = {
    type?: ModalType;
    visible?: boolean;
    label?: string;
    message?: string;
    onClose?: () => void;
    callback?: (value: any) => void;
}

export function Modal({ type, label, message, visible, onClose, callback }: ModalProps) {
    console.log("Modal rendered", type, visible, label, message);
    const CloseDialog = () => {
        onClose && onClose();
        return true;
    };

    
    if (type === "info") {
        const footer = <div>
            <button onClick={CloseDialog}>Close</button>
        </div>

        return (
            <Dialog header={label || "Information"} visible={visible} onHide={CloseDialog} footer={footer}>
                <p>{message}</p>
            </Dialog>
        )
    }

    else if (type === "confirm") {
        const footer = <div>
            <button onClick={() => { callback && callback(true); CloseDialog(); }}>Yes</button>
            <button onClick={() => { callback && callback(false); CloseDialog(); }}>No</button>
        </div>

        return (
            <Dialog header={label || "Confirmation"} visible={visible} onHide={CloseDialog} footer={footer}>
                <p>{message}</p>
            </Dialog>
        )
    }

    return <></>;
}