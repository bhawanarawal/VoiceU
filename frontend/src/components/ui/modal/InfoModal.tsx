import React from "react";
import { Modal } from "./index";
import Button from "../button/Button";

interface InfoModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  closeText?: string;
}

const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  title = "Information",
  message,
  onClose,
  closeText = "Close",
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {title && <h3 className="text-lg font-bold mb-4">{title}</h3>}
      <p className="mb-6">{message}</p>
      <div className="flex justify-end">
        <Button variant="primary" onClick={onClose}>
          {closeText}
        </Button>
      </div>
    </Modal>
  );
};

export default InfoModal;
