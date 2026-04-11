import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import Skeleton from "../components/ui/Skeleton";
import { useToast } from "../context/ToastContext";
import { feedbackService } from "../services/api";

function FeedbackPage() {
  const { success, error } = useToast();

  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const { data } = await feedbackService.list();
      setFeedbackList(data || []);
    } catch (err) {
      error(err.message || "Failed to load feedback.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const submitFeedback = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await feedbackService.create({ rating: Number(rating), comment });
      success("Thanks for your feedback.");
      setComment("");
      setRating("5");
      loadFeedback();
    } catch (err) {
      error(err.message || "Could not submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-split">
      <Card title="Share Feedback" subtitle="Help us improve quality and reliability">
        <form className="form-grid" onSubmit={submitFeedback}>
          <label>
            Rating
            <select value={rating} onChange={(e) => setRating(e.target.value)}>
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Good</option>
              <option value="3">3 - Average</option>
              <option value="2">2 - Needs Improvement</option>
              <option value="1">1 - Poor</option>
            </select>
          </label>

          <label>
            Comment
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience"
              required
            />
          </label>

          <Button type="submit" loading={submitting}>
            Submit Feedback
          </Button>
        </form>
      </Card>

      <Card title="Community Feedback" subtitle="Recent platform reviews">
        {loading ? (
          <Skeleton lines={5} />
        ) : feedbackList.length === 0 ? (
          <EmptyState
            title="No feedback yet"
            description="Be the first one to share your experience."
          />
        ) : (
          <div className="timeline-list">
            {feedbackList.map((item) => (
              <div className="timeline-item" key={item.id}>
                <div className="timeline-row">
                  <strong>{item.userName}</strong>
                  <span className="rating-chip">{item.rating}/5</span>
                </div>
                <p>{item.comment}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default FeedbackPage;
