import { Suspense, lazy } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const MainPage = lazy(() => import("./pages/main-page").then(m => ({ default: m.MainPage })));
const LoginPage = lazy(() => import("./pages/LoginPage").then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import("./pages/SignupPage").then(m => ({ default: m.SignupPage })));
const Dashboard = lazy(() => import("./pages/Dashboard").then(m => ({ default: m.Dashboard })));
const CreateRoomFragment = lazy(() => import("./pages/create-room-fragment").then(m => ({ default: m.CreateRoomFragment })));
const JoinControl = lazy(() => import("./pages/join-control").then(m => ({ default: m.JoinControl })));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  if (loading) {
    return <PageLoader />;
  }

  if (user) {
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes - redirect to dashboard if already logged in */}
        <Route path="/" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
        
        {/* Protected routes - require authentication */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/create-room" element={<ProtectedRoute><CreateRoomFragment /></ProtectedRoute>} />
        <Route path="/join-room" element={<ProtectedRoute><JoinControl /></ProtectedRoute>} />
        <Route path="/present/:roomCode" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  );
}

export function App() {
  return (
    <div className="min-h-screen text-foreground relative overflow-hidden">
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-size-[20px_20px] pointer-events-none"></div>

      <main>
        <Suspense fallback={<PageLoader />}>
          <AnimatedRoutes />
        </Suspense>
      </main>
    </div>
  );
}

export default App;

