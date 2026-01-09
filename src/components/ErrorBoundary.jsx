import React from 'react';
import { AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
        // Log to external service if needed
        if (window.location.hostname !== 'localhost') {
            // Send to error tracking service
            console.error('Production error:', {
                message: error.toString(),
                stack: errorInfo.componentStack
            });
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
                    <div className="text-center max-w-md">
                        <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
                        <p className="mb-4 text-gray-300">
                            An unexpected error occurred. Please try refreshing the page.
                        </p>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="text-left bg-gray-800 p-4 rounded text-sm overflow-auto max-h-64 mb-4">
                                <p className="font-mono text-red-400 mb-2">{this.state.error.toString()}</p>
                                <details className="text-gray-400">
                                    <summary className="cursor-pointer">Stack trace</summary>
                                    <pre className="mt-2 text-xs whitespace-pre-wrap break-words">
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </details>
                            </div>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium transition"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
