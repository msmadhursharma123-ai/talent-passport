import React from "react";

import UserDialogHeader from "./UserDialogHeader";
import UserDialogFooter from "./UserDialogFooter";

interface ConfirmDialogProps {

  open: boolean;

  title: string;

  message: string;

  confirmText?: string;

  onClose: () => void;

  onConfirm: () => void;

}

export default function ConfirmDialog({

  open,

  title,

  message,

  confirmText = "Confirm",

  onClose,

  onConfirm,

}: ConfirmDialogProps) {

  if (!open) {

    return null;

  }

  return (

    <div style={overlayStyle}>

      <div style={dialogStyle}>

        <UserDialogHeader

          title={title}

          onClose={onClose}

        />

        <div style={bodyStyle}>

          {message}

        </div>

        <UserDialogFooter

          saveLabel={confirmText}

          onCancel={onClose}

          onSave={onConfirm}

        />

      </div>

    </div>

  );

}

const overlayStyle: React.CSSProperties = {

  position: "fixed",

  inset: 0,

  background: "rgba(15,23,42,.4)",

  display: "flex",

  justifyContent: "center",

  alignItems: "center",

};

const dialogStyle: React.CSSProperties = {

  width: 460,

  background: "#FFFFFF",

  borderRadius: 16,

};

const bodyStyle: React.CSSProperties = {

  padding: 30,

  color: "#475569",

};