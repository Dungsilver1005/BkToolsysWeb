import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { ToolsList } from "./pages/ToolsList";
import { ToolDetail } from "./pages/ToolDetail";
import { ToolsInUse } from "./pages/ToolsInUse";
import { ExportReceipts } from "./pages/ExportReceipts";
import { ExportReceiptDetail } from "./pages/ExportReceiptDetail";
import { Statistics } from "./pages/Statistics";
import { Users } from "./pages/Users";
import { UserDetail } from "./pages/UserDetail";
import { ToolRequests } from "./pages/ToolRequests";
import { MyToolRequests } from "./pages/MyToolRequests";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tools"
        element={
          <ProtectedRoute>
            <Layout>
              <ToolsList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tools/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <ToolDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tools-in-use"
        element={
          <ProtectedRoute>
            <Layout>
              <ToolsInUse />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-requests"
        element={
          <ProtectedRoute>
            <Layout>
              <MyToolRequests />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/export-receipts"
        element={
          <ProtectedRoute requireAdmin>
            <Layout>
              <ExportReceipts />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/export-receipts/:id"
        element={
          <ProtectedRoute requireAdmin>
            <Layout>
              <ExportReceiptDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/statistics"
        element={
          <ProtectedRoute>
            <Layout>
              <Statistics />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute requireAdmin>
            <Layout>
              <Users />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/:id"
        element={
          <ProtectedRoute requireAdmin>
            <Layout>
              <UserDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tool-requests"
        element={
          <ProtectedRoute requireAdmin>
            <Layout>
              <ToolRequests />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
