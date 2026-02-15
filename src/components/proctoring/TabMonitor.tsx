import React, { useState, useEffect, useCallback } from 'react';
import { Alert, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { Warning, Error } from '@mui/icons-material';

interface TabMonitorProps {
    maxSwitches: number;
    onViolation: (count: number) => void;
    onTerminate: () => void;
}

const TabMonitor: React.FC<TabMonitorProps> = ({
    maxSwitches,
    onViolation,
    onTerminate,
}) => {
    const [tabSwitchCount, setTabSwitchCount] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [warningOpen, setWarningOpen] = useState(false);
    const [terminateOpen, setTerminateOpen] = useState(false);

    // Track visibility changes
    const handleVisibilityChange = useCallback(() => {
        if (document.hidden) {
            // Tab switched or window minimized
            const newCount = tabSwitchCount + 1;
            setTabSwitchCount(newCount);
            setIsVisible(false);

            if (newCount <= maxSwitches) {
                onViolation(newCount);

                if (newCount === maxSwitches) {
                    // Final warning
                    setWarningOpen(true);
                } else if (newCount > maxSwitches) {
                    // Terminate assessment
                    setTerminateOpen(true);
                    onTerminate();
                }
            }
        } else {
            setIsVisible(true);
        }
    }, [tabSwitchCount, maxSwitches, onViolation, onTerminate]);

    // Track blur events (for older browsers)
    const handleBlur = useCallback(() => {
        if (document.activeElement?.tagName === 'IFRAME') {
            return; // Ignore iframe focus
        }
        handleVisibilityChange();
    }, [handleVisibilityChange]);

    // Setup event listeners
    useEffect(() => {
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', () => setIsVisible(true));

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', () => setIsVisible(true));
        };
    }, [handleVisibilityChange, handleBlur]);

    // Auto-close warnings
    useEffect(() => {
        if (warningOpen) {
            const timer = setTimeout(() => {
                setWarningOpen(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [warningOpen]);

    // Force terminate after final warning
    useEffect(() => {
        if (tabSwitchCount > maxSwitches) {
            const timer = setTimeout(() => {
                onTerminate();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [tabSwitchCount, maxSwitches, onTerminate]);

    return (
        <>
            {/* Tab Switch Counter Display */}
            <Box className="fixed top-4 right-4 z-50">
                <Box className={`px-3 py-2 rounded-lg ${!isVisible ? 'bg-red-100 border border-red-300' : 'bg-green-100 border border-green-300'}`}>
                    <Typography variant="caption" className="flex items-center">
                        {isVisible ? (
                            <>
                                <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                                Window Active
                            </>
                        ) : (
                            <>
                                <div className="w-2 h-2 bg-red-600 rounded-full mr-2 animate-pulse"></div>
                                Warning: Window Inactive
                            </>
                        )}
                    </Typography>
                    <Typography variant="body2" className="font-medium mt-1">
                        Tab Switches: {tabSwitchCount}/{maxSwitches}
                    </Typography>
                </Box>
            </Box>

            {/* Warning Dialog */}
            <Dialog open={warningOpen} onClose={() => setWarningOpen(false)}>
                <DialogTitle className="flex items-center text-yellow-600">
                    <Warning className="mr-2" />
                    Final Warning
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        You have switched tabs/windows {tabSwitchCount} times.
                        If you switch tabs again, your assessment will be terminated automatically.
                    </Typography>
                    <Typography variant="body2" className="mt-2 text-gray-600">
                        Please remain in this window for the duration of the assessment.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setWarningOpen(false)} color="primary">
                        Acknowledge
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Termination Dialog */}
            <Dialog open={terminateOpen} onClose={() => setTerminateOpen(false)}>
                <DialogTitle className="flex items-center text-red-600">
                    <Error className="mr-2" />
                    Assessment Terminated
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Your assessment has been terminated due to excessive tab/window switching.
                    </Typography>
                    <Typography variant="body2" className="mt-2 text-gray-600">
                        You switched tabs/windows {tabSwitchCount} times, exceeding the maximum allowed ({maxSwitches}).
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onTerminate} color="primary">
                        Close Assessment
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Full Screen Warning */}
            {!isVisible && tabSwitchCount <= maxSwitches && (
                <Box className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
                    <Alert
                        severity="warning"
                        className="max-w-md"
                        icon={<Warning fontSize="large" />}
                    >
                        <Typography variant="h6" className="mb-2">
                            Return to Assessment
                        </Typography>
                        <Typography>
                            Please return to the assessment window immediately.
                            This is warning {tabSwitchCount} of {maxSwitches}.
                        </Typography>
                    </Alert>
                </Box>
            )}
        </>
    );
};

export default TabMonitor;