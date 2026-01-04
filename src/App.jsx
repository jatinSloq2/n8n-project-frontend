import { useSelector } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import Dashboard from './pages/Dashboard';
import ExecutionDetail from './pages/ExecutionDetail';
import Executions from './pages/Executions';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import WorkflowEditor from './pages/WorkflowEditor';
import Workflows from './pages/Workflows';

function PrivateRoute({ children }) {
  const { token } = useSelector((state) => state.auth);
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/workflows"
          element={
            <PrivateRoute>
              <Workflows />
            </PrivateRoute>
          }
        />
        <Route
          path="/workflows/:id"
          element={
            <PrivateRoute>
              <WorkflowEditor />
            </PrivateRoute>
          }
        />
        <Route
          path="/executions"
          element={
            <PrivateRoute>
              <Executions />
            </PrivateRoute>
          }
        />
        <Route
          path="/executions/:id"
          element={
            <PrivateRoute>
              <ExecutionDetail />
            </PrivateRoute>
          }
        />
      </Routes>
      <Toaster position="top-right" />
    </>
  );
}

export default App;