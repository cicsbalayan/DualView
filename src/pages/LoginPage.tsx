import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Presentation } from 'lucide-react';
import {
  pageVariants,
  staggerContainer,
  fadeInUp,
  defaultPageTransition,
} from '@/lib/animation-variants';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center px-4 py-10"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={defaultPageTransition}
    >
      <motion.div 
        className="w-full max-w-md"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Logo */}
        <motion.div 
          className="flex justify-center mb-6"
          variants={fadeInUp}
        >
          <motion.div 
            className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Presentation className="w-8 h-8 text-primary" />
          </motion.div>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card className="shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-destructive/10 border border-destructive/50 text-destructive text-sm px-4 py-2 rounded-md"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <motion.div className="space-y-2" variants={fadeInUp}>
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </motion.div>
                
                <motion.div className="space-y-2" variants={fadeInUp}>
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </motion.div>
                
                <motion.div variants={fadeInUp}>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </motion.div>
              </form>
              
              <motion.div 
                className="mt-4 text-center text-sm"
                variants={fadeInUp}
              >
                <span className="text-muted-foreground">Don't have an account? </span>
                <Link to="/signup" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default LoginPage;

