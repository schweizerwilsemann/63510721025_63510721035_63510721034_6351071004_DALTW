import React, { useEffect, useState } from "react";
import moment from "moment";
import { FaThumbsUp } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Button, Textarea } from "flowbite-react";
import { toast } from "react-toastify";
import axios from "axios";

export default function Comment({ comment, onLike, onEdit, onDelete }) {
  const [user, setUser] = useState({});
  const [isEditting, setIsEditting] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const { currentUser } = useSelector((state) => state.user);
  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/users/${comment.userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (response) {
          setUser(response.data);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    getUser();
  }, [comment]);

  const handleEdit = () => {
    setIsEditting(true);
    setEditedContent(comment.content);
  };
  const handleSave = async () => {
    try {
      if (!currentUser) {
        navigate("/sign-in");
        return;
      }

      if (editedContent.length < 10) {
        return toast.warning("Comment must contain at least 10 characters!");
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/comments/${comment.id}`,
        { editedContent },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response) {
        setIsEditting(false);
        onEdit(comment, editedContent);
      }
    } catch (error) {
      console.log("Error saving comment:", error.message);
    }
  };

  return (
    <div className="flex p-4 border-b dark:border-gray-600 text-sm">
      <div className="flex-shrink-0 mr-3">
        <img
          className="w-10 h-10 rounded-full bg-gray-200"
          src={user.photoURL}
          alt={user.username}
        />
      </div>
      <div className="flex-1">
        <div className="flex items-center mb-1 p-1">
          <span className="font-bold mr-1 text-xs truncate">
            {user ? `@${user.username}` : "anonymous user"}
          </span>
          <span className="text-gray-500 text-xs">
            {moment(comment.createdAt).fromNow()}
          </span>
        </div>
        {isEditting ? (
          <>
            <Textarea
              className="mb-2"
              value={editedContent}
              onChange={(event) => setEditedContent(event.target.value)}
            />
            <div className="flex justify-end gap-2 text-xs">
              <Button
                type="button"
                size="sm"
                gradientDuoTone="purpleToPink"
                onClick={handleSave}
              >
                Save
              </Button>

              <Button
                type="button"
                size="sm"
                gradientDuoTone="purpleToBlue"
                outline
                onClick={() => setIsEditting(false)}
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-500 dark:text-green-300 mb-2">
              {comment.content}
            </p>
            <div className="flex items-center pt-2 text-xs border-t dark:border-gray-700 max-w-fit gap-2">
              <button
                className={`text-gray-400 hover:text-sky-300 ${
                  currentUser &&
                  comment.likes?.includes(currentUser?.id) &&
                  "!text-sky-300"
                } `}
                type="button"
                onClick={() => onLike(comment.id)}
              >
                <FaThumbsUp className="text sm " />
              </button>
              <p className="text-gray-400">
                {comment.numberOfLikes > 0 &&
                  comment.numberOfLikes +
                    " " +
                    (comment.numberOfLikes === 1 ? "Like" : "Likes")}
              </p>
              {currentUser &&
                (currentUser.id === comment.userId || currentUser.isAdmin) && (
                  <>
                    <button
                      type="button"
                      onClick={handleEdit}
                      className="text-gray-400 hover:text-sky-300"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(comment.id)}
                      className="text-gray-400 hover:text-rose-500"
                    >
                      Delete
                    </button>
                  </>
                )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
