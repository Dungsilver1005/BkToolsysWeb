import { Modal as AntModal } from "antd";

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "medium",
}) => {
  const widthMap = {
    small: 400,
    medium: 600,
    large: 900,
  };

  return (
    <AntModal
      title={title}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={widthMap[size]}
      destroyOnClose
    >
      {children}
    </AntModal>
  );
};
