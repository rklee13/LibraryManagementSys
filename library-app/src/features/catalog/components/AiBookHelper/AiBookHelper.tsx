import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../../redux/ReduxStore";
import { fetchAiRecommendations } from "../../../../redux/slices/AiRecommendationSlice";
import { BookCard } from "../../../book";
import "./AiBookHelper.css";

export const AiBookHelper: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const user = useSelector((state: RootState) => state.authentication.loggedInUser);
    const { recommendations, loading, error } = useSelector((state: RootState) => state.aiRecommendations);
    const [prompt, setPrompt] = useState("");
    const [isOpen, setIsOpen] = useState(true);

    const askForRecommendations = (includeHistory: boolean) => {
        const request: { prompt?: string; userId?: string } = {};
        if (prompt.trim()) request.prompt = prompt.trim();
        if (includeHistory && user) request.userId = user._id;
        if (request.prompt || request.userId) dispatch(fetchAiRecommendations(request));
    };

    return (
        <section className="ai-book-helper">
            <button
                className="ai-book-helper-toggle"
                type="button"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((open) => !open)}
            >
                <span>✨ AI Book Helper</span>
                <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && (
                <div className="ai-book-helper-content">
                    <p>Tell us what you would like to read and we’ll find a match in the catalog.</p>
                    <label className="ai-book-helper-label" htmlFor="ai-book-prompt">What are you in the mood to read?</label>
                    <textarea
                        id="ai-book-prompt"
                        value={prompt}
                        onChange={(event) => setPrompt(event.target.value)}
                        placeholder="Describe what you're in the mood to read..."
                        rows={3}
                        maxLength={1000}
                    />
                    <div className="ai-book-helper-actions">
                        <button
                            type="button"
                            onClick={() => askForRecommendations(false)}
                            disabled={loading || !prompt.trim()}
                        >
                            Ask AI
                        </button>
                        {user && (
                            <button
                                type="button"
                                className="ai-book-helper-history-button"
                                onClick={() => askForRecommendations(true)}
                                disabled={loading}
                            >
                                Recommend From My Reading History
                            </button>
                        )}
                    </div>
                    {loading && (
                        <div className="ai-book-helper-loading" role="status">
                            <span className="ai-book-helper-spinner" aria-hidden="true" />
                            Finding books for you...
                        </div>
                    )}
                    {error && <p className="ai-book-helper-error" role="alert">{error}</p>}
                    {!loading && recommendations.length > 0 && (
                        <div className="ai-book-helper-results">
                            {recommendations.map(({ book, reason }) => (
                                <article className="ai-book-helper-result" key={book._id}>
                                    <BookCard book={book} />
                                    <p className="ai-book-helper-reason"><strong>Why this fits:</strong> {reason}</p>
                                </article>
                            ))}
                        </div>
                    )}
                    {!loading && !error && recommendations.length === 0 && (
                        <p className="ai-book-helper-empty">Your recommendations will appear here.</p>
                    )}
                </div>
            )}
        </section>
    );
};
