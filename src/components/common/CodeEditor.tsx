import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import {
    Box, Select, MenuItem, FormControl, InputLabel,
    Button, Typography
} from '@mui/material';
import { PlayArrow, RestartAlt } from '@mui/icons-material';

interface CodeEditorProps {
    language: string;
    starterCode?: string | Record<string, string>;
    value: string;
    onChange: (code: string) => void;
    height?: string;
    readOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
    language,
    starterCode,
    value,
    onChange,
    height = '400px',
    readOnly = false,
}) => {
    const [selectedLanguage, setSelectedLanguage] = useState(language);
    const [output, setOutput] = useState<string>('');
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const editorRef = useRef<any>(null);

    // Monaco language mapping
    const getMonacoLanguage = (lang: string): string => {
        const languageMap: Record<string, string> = {
            'javascript': 'javascript',
            'python': 'python',
            'java': 'java',
            'c++': 'cpp',
            'cpp': 'cpp',
            'sql': 'sql',
        };
        return languageMap[lang.toLowerCase()] || 'javascript';
    };

    // Handle language change
    const handleLanguageChange = (newLang: string) => {
        setSelectedLanguage(newLang);
        if (starterCode && typeof starterCode === 'object') {
            const newStarter = (starterCode as any)[newLang];
            if (newStarter && !value) {
                onChange(newStarter);
            }
        }
    };

    // Run code (mock implementation)
    const runCode = async () => {
        setIsRunning(true);
        setError(null);
        setOutput('');

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const mockOutputs: Record<string, string> = {
                'javascript': 'Code executed successfully!\nOutput: Hello World',
                'python': 'Code executed successfully!\nOutput: Hello World',
                'java': 'Code compiled and executed successfully!\nOutput: Hello World',
                'c++': 'Code compiled and executed successfully!\nOutput: Hello World',
                'sql': 'Query executed successfully!\nRows returned: 10',
            };
            setOutput(mockOutputs[selectedLanguage] || 'Code executed successfully!');
        } catch (err: any) {
            setError(err.message || 'Failed to execute code');
        } finally {
            setIsRunning(false);
        }
    };

    // Reset to starter code
    const resetCode = () => {
        if (starterCode) {
            if (typeof starterCode === 'object') {
                onChange((starterCode as any)[selectedLanguage] || '');
            } else {
                onChange(starterCode);
            }
        } else {
            onChange('');
        }
        setOutput('');
        setError(null);
    };

    // Editor options optimized for assessment
    const editorOptions = {
        readOnly,
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: 'Fira Code, Consolas, monospace',
        lineNumbers: 'on' as const,
        folding: false,
        scrollBeyondLastLine: false,
        wordWrap: 'on' as const,
        automaticLayout: true,
        renderLineHighlight: 'gutter' as const,
    };

    return (
        <Box className="space-y-4">
            {/* Language Selector and Controls */}
            <Box className="flex justify-between items-center">
                <FormControl size="small" className="w-48">
                    <InputLabel>Language</InputLabel>
                    <Select
                        value={selectedLanguage}
                        label="Language"
                        onChange={(e) => handleLanguageChange(e.target.value as string)}
                        disabled={readOnly}
                    >
                        <MenuItem value="javascript">JavaScript</MenuItem>
                        <MenuItem value="python">Python</MenuItem>
                        <MenuItem value="java">Java</MenuItem>
                        <MenuItem value="c++">C++</MenuItem>
                        <MenuItem value="sql">SQL</MenuItem>
                    </Select>
                </FormControl>

                <Box className="flex space-x-2">
                    <Button
                        variant="outlined"
                        startIcon={<RestartAlt />}
                        onClick={resetCode}
                        disabled={readOnly}
                    >
                        Reset
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<PlayArrow />}
                        onClick={runCode}
                        disabled={isRunning || readOnly}
                    >
                        {isRunning ? 'Running...' : 'Run Code'}
                    </Button>
                </Box>
            </Box>

            {/* Monaco Editor */}
            <Box className="border border-gray-300 rounded-lg overflow-hidden">
                <Editor
                    height={height}
                    language={getMonacoLanguage(selectedLanguage)}
                    theme="vs-dark"
                    value={value}
                    onChange={onChange as any}
                    onMount={(editor, monaco) => {
                        editorRef.current = editor;
                    }}
                    options={editorOptions}
                />
            </Box>

            {/* Output Area */}
            {(output || error) && (
                <Box className="border border-gray-300 rounded-lg overflow-hidden">
                    <Box className="bg-gray-800 px-4 py-2">
                        <Typography variant="subtitle2" className="text-white font-medium">
                            Output
                        </Typography>
                    </Box>
                    <Box className="p-4 bg-gray-900 text-gray-100 font-mono text-sm">
                        <pre className="whitespace-pre-wrap">
                            {error ? (
                                <span className="text-red-400">{error}</span>
                            ) : (
                                output
                            )}
                        </pre>
                    </Box>
                </Box>
            )}

            {/* Language Info */}
            <Box className="text-sm text-gray-600">
                <Typography variant="caption">
                    Language: {selectedLanguage} | Lines: {value.split('\n').length} |
                    Characters: {value.length}
                </Typography>
            </Box>
        </Box>
    );
};

export default CodeEditor;