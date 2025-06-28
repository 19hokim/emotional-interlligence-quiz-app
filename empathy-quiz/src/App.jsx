// EmpathyQuizApp.jsx
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/utils/supabaseClient";

const questions = [
	{
		type: "likert",
		text: "I can easily tell when someone is uncomfortable, even if they don't say it out loud.",
		trait: "empathy_perception",
	},
	{
		type: "likert",
		text: "When someone is upset, I tend to understand why without needing them to explain in detail.",
		trait: "empathy_reasoning",
	},
	{
		type: "scenario",
		text: "Your friend was passed over for a promotion they worked hard for and are visibly hurt. How do you respond?",
		trait: "empathy_response",
		options: [
			"Tell them they'll do better next time and try to move the topic on.",
			"Acknowledge their disappointment and ask if they want to talk about it.",
			"Point out the flaws in their approach so they understand why they didn't get promoted.",
			"Say nothing unless they bring it up themselves.",
		],
	},
	{
		type: "scenario",
		text: "A colleague starts crying at work after receiving criticism in a meeting. What is your first reaction?",
		trait: "empathy_behavior",
		options: [
			"Wait until later to say something so they can calm down.",
			"Approach them gently and ask if they're okay.",
			"Assume they're being overly sensitive.",
			"Mention it to HR or a manager.",
		],
	},
	{
		type: "likert",
		text: "I try to imagine how others feel in tough situations, even if I've never been through the same myself.",
		trait: "perspective_taking",
	},
	{
		type: "likert",
		text: "People often come to me for emotional support.",
		trait: "empathy_trustworthiness",
	},
	{
		type: "likert",
		text: "I find it easy to see things from other people's points of view.",
		trait: "empathy_perspective",
	},
	{
		type: "likert",
		text: "I get emotionally affected when I see someone else crying.",
		trait: "emotional_resonance",
	},
	{
		type: "scenario",
		text: "You see a stranger drop their phone and look stressed. What do you do?",
		trait: "empathy_spontaneity",
		options: [
			"Keep walking — it's not your problem.",
			"Ask if they need help and offer assistance.",
			"Wait to see if someone else helps first.",
			"Make a joke to lighten the mood.",
		],
	},
	{
		type: "scenario",
		text: "You're in a group and someone keeps getting interrupted. What do you do?",
		trait: "empathy_advocacy",
		options: [
			"Interrupt the interrupters and defend them.",
			"Politely redirect attention back to the person being interrupted.",
			"Do nothing — it's part of group dynamics.",
			"Apologize to them privately later.",
		],
	},
	{
		type: "likert",
		text: "I tend to notice subtle emotional shifts in conversations.",
		trait: "emotional_awareness",
	},
	{
		type: "likert",
		text: "I enjoy helping people feel heard and understood.",
		trait: "compassionate_response",
	},
	{
		type: "scenario",
		text: "A friend lashes out at you after a bad day. How do you react?",
		trait: "empathy_control",
		options: [
			"Tell them to stop being rude and walk away.",
			"Try to understand they’re upset and ask if something's wrong.",
			"Get defensive and argue back.",
			"Ignore it and distance yourself emotionally.",
		],
	},
	{
		type: "likert",
		text: "I adjust my behavior depending on who I'm talking to and how they seem to feel.",
		trait: "adaptive_empathy",
	},
	{
		type: "scenario",
		text: "Someone expresses nervousness about a group presentation. What’s your response?",
		trait: "empathy_support",
		options: [
			"Tell them to just get over it.",
			"Remind them they’re not alone and offer to practice together.",
			"Say nothing and let them deal with it themselves.",
			"Make fun of them to lighten the mood.",
		],
	},
	{
		type: "likert",
		text: "When someone tells me about their problems, I usually feel what they’re feeling.",
		trait: "emotional_involvement",
	},
	{
		type: "likert",
		text: "I reflect on how my words might impact someone emotionally.",
		trait: "empathy_self_regulation",
	},
	{
		type: "scenario",
		text: "A teammate performs poorly on a shared project. What do you do?",
		trait: "empathy_balanced_feedback",
		options: [
			"Call them out directly in front of others.",
			"Offer feedback privately and ask if something’s been bothering them.",
			"Avoid them for future group work.",
			"Let it go — it’s not worth addressing.",
		],
	},
	{
		type: "likert",
		text: "I consider cultural or personal backgrounds when interpreting someone’s emotions.",
		trait: "cultural_empathy",
	},
	{
		type: "likert",
		text: "I value emotional intelligence as much as logical reasoning.",
		trait: "empathy_value_balance",
	},
];

const likertScale = [
	"Strongly Disagree",
	"Disagree",
	"Neutral",
	"Agree",
	"Strongly Agree",
];

function EmpathyQuizApp() {
    const [step, setStep] = useState(0);
    const [responses, setResponses] = useState([]);
    const [scoreSaved, setScoreSaved] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [name, setName] = useState("");
    const [nameEntered, setNameEntered] = useState(false);
    const [likertSelection, setLikertSelection] = useState(null);
    const currentQuestion = questions[step];

    React.useEffect(() => {
        if (step >= questions.length && !scoreSaved) {
            const score = calculateScore();
            const maxScore =
                questions.filter((q) => q.type === "likert").length * 4 +
                questions.filter((q) => q.type === "scenario").length * 4;
            const percentage = Math.round((score / maxScore) * 100);
            const durationSeconds = Math.floor((Date.now() - startTime) / 1000);

            saveToDatabase(score, percentage, durationSeconds);
            setScoreSaved(true);
        }
    }, [step, scoreSaved, startTime]);

    // Update handleLikertChange to only set the selection, not advance
    const handleLikertChange = (value) => {
        setLikertSelection(value);
    };

    const handleScenarioChoice = (index) => {
        setResponses([...responses, index]);
        setStep(step + 1);
    };

    const calculateScore = () => {
        let total = 0;
        questions.forEach((q, i) => {
            if (responses[i] === undefined) return;
            if (q.type === "likert") {
                total += responses[i];
            } else if (q.type === "scenario") {
                const weights = [1, 4, 0, 2];
                total += weights[responses[i]] ?? 0;
            }
        });
        return total;
    };

    const saveToDatabase = async (score, percentage, durationSeconds) => {
        const { error } = await supabase.from("responses").insert({
            name,
            responses,
            score,
            percentage,
            duration_seconds: durationSeconds,
            timestamp: new Date().toISOString(),
        });
        if (error) console.error("Error saving result:", error);
    };

    // Show name input before quiz starts
    if (!nameEntered) {
        return (
            <div className="max-w-xl mx-auto p-4">
                <Card>
                    <CardContent className="p-6 text-center">
                        <h2 className="text-2xl font-semibold mb-4">Welcome to the Empathy Quiz</h2>
                        <p className="mb-4">Please enter your name to begin:</p>
                        <input
                            type="text"
                            className="border rounded px-3 py-2 mb-4 w-full"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <Button
                            disabled={!name.trim()}
                            onClick={() => {
                                setNameEntered(true);
                                setStartTime(Date.now());
                            }}
                        >
                            Start Quiz
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (step >= questions.length) {
        const score = calculateScore();
        const maxScore =
            questions.filter((q) => q.type === "likert").length * 4 +
            questions.filter((q) => q.type === "scenario").length * 4;
        const percentage = Math.round((score / maxScore) * 100);
        const durationSeconds = Math.floor((Date.now() - startTime) / 1000);

        let summary = "";
        if (percentage >= 85)
            summary = "You have an exceptionally high level of emotional empathy.";
        else if (percentage >= 70)
            summary = "You are highly empathetic and emotionally attuned to others.";
        else if (percentage >= 50)
            summary = "You show moderate empathy, with some areas to grow.";
        else
            summary =
                "You may benefit from practicing emotional awareness and empathy more often.";

        return (
            <div className="max-w-xl mx-auto p-4">
                <Card>
                    <CardContent className="p-6 text-center">
                        <h2 className="text-2xl font-semibold mb-4">
                            Your Empathy Score
                        </h2>
                        <p className="text-4xl font-bold mb-2">{percentage}%</p>
                        <p className="text-lg mb-4">{summary}</p>
                        <p className="text-sm text-muted-foreground">
                            Time taken: {durationSeconds} seconds
                        </p>
                        <Button
                            onClick={() => {
                                setStep(0);
                                setResponses([]);
                                setScoreSaved(false);
                                setNameEntered(false);
                                setName("");
                                setStartTime(null);
                            }}
                            className="mt-4"
                        >
                            Retake Quiz
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center"
            style={{
                background: "#ffe4ec", // sakura pink for the whole page
                minHeight: "100vh",
                width: "100vw",
            }}
        >
            <Card
                style={{
                    background: "#f8b7cd", // darker sakura for card
                    color: "#4b1c2f",      // deep plum for text
                    boxShadow: "0 4px 24px rgba(200, 80, 120, 0.15)",
                    border: "1px solid #e75480",
                }}
            >
                <CardContent className="p-6">
                    <h2
                        className="text-xl font-semibold mb-4"
                        style={{ color: "#a03e5c" }} // even darker for headings
                    >
                        Question {step + 1} of {questions.length}
                    </h2>
                    <p
                        className="mb-4"
                        style={{ color: "#7c2946" }} // dark pink for question text
                    >
                        {currentQuestion.text}
                    </p>

                    {currentQuestion.type === "likert" && (
                        <>
                            <RadioGroup
                                value={likertSelection !== null ? likertSelection.toString() : ""}
                                onValueChange={handleLikertChange}
                                name={`likert-${step}`}
                                className="space-y-2"
                            >
                                {likertScale.map((option, index) => (
                                    <RadioGroupItem
                                        key={option}
                                        value={index.toString()}
                                        id={`likert-${step}-${index}`}
                                    >
                                        <span style={{ color: "#4b1c2f" }}>{option}</span>
                                    </RadioGroupItem>
                                ))}
                            </RadioGroup>
                            <Button
                                style={{
                                    background: "#e75480", // vivid sakura/dark pink
                                    color: "#fff",
                                    border: "none",
                                    boxShadow: "0 2px 8px rgba(200, 80, 120, 0.10)",
                                }}
                                className="mt-4"
                                disabled={likertSelection === null}
                                onClick={() => {
                                    setResponses([...responses, parseInt(likertSelection)]);
                                    setStep(step + 1);
                                    setLikertSelection(null);
                                }}
                            >
                                Next
                            </Button>
                        </>
                    )}

                    {currentQuestion.type === "scenario" && (
                        <div className="space-y-2">
                            {currentQuestion.options.map((option, index) => (
                                <Button
                                    key={index}
                                    className="w-full justify-start text-left"
                                    style={{
                                        background: "#f8b7cd",
                                        color: "#4b1c2f",
                                        border: "1px solid #e75480",
                                    }}
                                    onClick={() => handleScenarioChoice(index)}
                                    variant="outline"
                                >
                                    {option}
                                </Button>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default EmpathyQuizApp;