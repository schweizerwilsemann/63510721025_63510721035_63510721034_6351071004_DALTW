import { Alert, Button, Modal, Textarea } from "flowbite-react";
import React, { Children, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Comment from "./Comment";
import { useNavigate } from "react-router-dom";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { toast } from "react-toastify";
import axios from "axios";

export default function CommentSection({ bookId }) {
  const { currentUser } = useSelector((state) => state.user);
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState(null);
  const [comments, setComments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (comment.length > 200 || comment.length <= 10) {
      toast.warning("Comment must be between 10 and 200 characters!");
      return;
    }
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/comments`,
        { content: comment, bookId, userId: currentUser.id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response) {
        setComment("");
        setCommentError(null);
        setComments([response.data, ...comments]);
      }
    } catch (error) {
      setCommentError(error.message);
    }
  };

  const handleLike = async (commentId) => {
    try {
      if (!currentUser) {
        navigate("/sign-in");
        return;
      }
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/comments/${commentId}/likes`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res) {
        setComments(
          comments.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  likes: res.data.likes,
                  numberOfLikes: res.data.likes.length,
                }
              : comment
          )
        );
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    const getComments = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/comments/book/${bookId}`
        );
        if (res.ok) {
          const data = await res.json();
          setComments(data);
        }
      } catch (error) {
        console.log(">>>Check comments error: ", error.message);
      }
    };
    getComments();
  }, [bookId]);

  const handleEdit = async (comment, editedContent) => {
    setComments(
      comments.map((c) =>
        c.id === comment.id ? { ...c, content: editedContent } : c
      )
    );
  };

  const handleDelete = async (commentId) => {
    setShowModal(false);
    try {
      if (!currentUser) {
        navigate("/sign-in");
        return;
      }
      const res = await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/comments/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res) {
        setComments(comments.filter((comment) => comment.id !== commentId));
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <div className="max-w-2xl mx-auto w-full p-3 ">
      {currentUser ? (
        <div className="flex items-center gap-1 my-5 text-gray-500 text-sm ">
          <p>Logged in as: </p>
          <img
            className="h-5 w-5 object-cover rounded-full"
            src={currentUser.photoURL}
            alt=""
          />
          <Link
            to={`/dashboard?tab=profile`}
            className="text-xs text-cyan-700 dark:text-teal-200 hover:underline"
          >
            @{currentUser.username}
          </Link>
        </div>
      ) : (
        <div className="text-sm text-cyan-700 dark:text-teal-200 flex gap-1">
          You must be logged in to comment!
          <Link to="/sign-in" className="text-rose-500 hover:underline">
            Log in
          </Link>
        </div>
      )}
      {currentUser && (
        <>
          <form
            onSubmit={handleSubmit}
            className="border border-teal-500  rounded-md p-3"
          >
            <Textarea
              placeholder="Add a comment . . ."
              rows="3"
              onChange={(event) => setComment(event.target.value)}
              value={comment}
              maxLength="200"
            />
            <div className="flex justify-between items-center mt-5">
              <p className="text-gray-500 text-xs">
                {200 - comment.length} characters remaining
              </p>
              <Button outline gradientDuoTone="redToYellow" type="submit">
                Comment
              </Button>
            </div>
          </form>
          {commentError && (
            <Alert color="failure" className="mt-5">
              {commentError}
            </Alert>
          )}
          {comments.length === 0 ? (
            <p className="text-sm my-5">No comments yet!</p>
          ) : (
            <>
              <div className="text-sm my-5 flex items-center gap-1">
                <p>Comments</p>
                <div className="border border-gray-400 py-2 px-3 rounded-sm">
                  <p>{comments.length}</p>
                </div>
              </div>
              {comments.map((comment) => (
                <Comment
                  key={comment.id}
                  comment={comment}
                  onLike={handleLike}
                  onEdit={handleEdit}
                  onDelete={(comment) => {
                    setShowModal(true), setCommentToDelete(comment);
                  }}
                />
              ))}
            </>
          )}
        </>
      )}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
      >
        <Modal.Header className="bg-lime-200" />
        <Modal.Body className="bg-lime-200">
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-cyan-500 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-indigo-900 dark:text-gray-200">
              Are you sure to delete this comment?
            </h3>
          </div>
          <div className="flex justify-center gap-4">
            <Button
              className=""
              color="failure"
              onClick={() => handleDelete(commentToDelete)}
            >
              Yes, I'm Sure
            </Button>
            <Button color="gray" onClick={() => setShowModal(false)}>
              No, cancel
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
