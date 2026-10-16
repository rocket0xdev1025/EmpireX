import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="page empty-page">
      <h1>Page not found</h1>
      <button className="ghost-btn" onClick={() => navigate("/")}>Back to Empire</button>
    </div>
  );
}
