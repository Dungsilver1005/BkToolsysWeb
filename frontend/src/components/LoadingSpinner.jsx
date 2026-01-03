import "./LoadingSpinner.css";

export const LoadingSpinner = ({ size = "medium" }) => {
  return (
    <div className={`loading-spinner spinner-${size}`}>
      <div className="spinner"></div>
    </div>
  );
};
