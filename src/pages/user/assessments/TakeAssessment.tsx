import React, { useRef, useState } from 'react'
import { Page } from '../../../components/ui/Page';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../../../services/axios/api';
import toast from 'react-hot-toast';

const TakeAssessment: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    // const [answers, setAnswers] = useState<Answer[]>([]);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [userAssessmentId, setUserAssessmentId] = useState<number | null>(null);
    const [sessionId, setSessionId] = useState<number | null>(null);
    // const [violations, setViolations] = useState<any[]>([]);
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const answerTimers = useRef<Record<number, number>>({});

    const { data: assessmentData, isLoading } = useQuery({
        queryKey: ['assessment', id],
        queryFn: () => api.get(`/assessments/${id}`),
        enabled: !!id,
    });

    const startMutation = useMutation({
        mutationFn: () => api.post(`/assessments/${id}/start`),
        onSuccess: (data) => {
            setUserAssessmentId(data.userAssessmentId);
            setSessionId(data.sessionId);
            setStartTime(new Date());
            setTimeLeft(data.assessment.duration * 60); // Convert to seconds

            // Initialize answer timers
            data.assessment.questions.forEach((q) => {
                answerTimers.current[q.questionId] = 0;
            });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to start assessment');
            navigate('/assessments');
        },
    });

    // Submit answer mutation
    const submitAnswerMutation = useMutation({
        mutationFn: (data) => api.post(`/assessments/${id}/answer`, data),
        onError: (error) => {
            toast.error('Failed to save answer');
        },
    });

    

    return (
        <Page>
            <div>TakeAssessment {id}</div>
        </Page>
    )
}

export default TakeAssessment;