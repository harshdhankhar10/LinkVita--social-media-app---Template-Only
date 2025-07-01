import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker from 'emoji-picker-react';
import MDEditor from '@uiw/react-md-editor';

import { format } from 'date-fns';
import {
  X, Image as ImageIcon, Video, File, Smile, MapPin, UserPlus, Hash,
  Globe, Users, Lock, Calendar, MessageSquare, Repeat, Eye, Edit
} from 'react-feather';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import {storage} from "@/Firebase/Firebase";
import { useAuth } from '@/context/AuthContext';
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";


interface CreatePostProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (newPost: any) => void;
}

type FormStep = 'content' | 'metadata' | 'settings' | 'preview';

interface PostData {
  content: string;
  mediaUrl: string;
  hashtags: string[];
  mentions: string[];
  taggedUsers: string[];
  location: string;
  visibility: 'public' | 'friends' | 'private';
  scheduledAt?: Date;
  allowComments: boolean;
  allowSharing: boolean;
}

const CreatePost: React.FC<CreatePostProps> = ({ isOpen, onClose, onPostCreated }) => {
  const auth = useAuth();
  const user = auth?.auth?.user;
  const [currentStep, setCurrentStep] = useState<FormStep>('content');
  const [postData, setPostData] = useState<PostData>({
    content: '',
    mediaUrl: '',
    hashtags: [],
    mentions: [],
    taggedUsers: [],
    location: '',
    visibility: 'public',
    allowComments: true,
    allowSharing: true
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [date, setDate] = useState<Date>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);

  const handleFileChange = async (e: any) => {
    const file = e.target.files[0];
    const storageRef = ref(storage, `linkVita_posts_${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      }, 
      (error) => {
        console.log(error);
      }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setMedia(downloadURL);
        setMediaPreview(downloadURL);

      }
    );
  }





  
  const addEmoji = (emojiData: any) => {
    setPostData(prev => ({
      ...prev,
      content: prev.content + emojiData.emoji
    }));
    setShowEmojiPicker(false);
  };

  const addHashtag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value) {
      const newTag = e.currentTarget.value.startsWith('#') 
        ? e.currentTarget.value 
        : `#${e.currentTarget.value}`;
      
      if (!postData.hashtags.includes(newTag)) {
        setPostData(prev => ({
          ...prev,
          hashtags: [...prev.hashtags, newTag]
        }));
        e.currentTarget.value = '';
      }
    }
  };

  const removeHashtag = (tag: string) => {
    setPostData(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(`${import.meta.env.VITE_REACT_APP_API}/api/v1/post/create`, {
        ...postData,
        mediaUrl: media,
        scheduledAt: isScheduling ? date : undefined
      })
      if(response.data.success){
        toast.success('Post created successfully!');
        onPostCreated(response.data.post);

        resetForm();
        onClose();
      }
      else{
        toast.error('Failed to create post. Please try again.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error creating post. Please try again.');
    }finally{
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPostData({
      content: '',
      mediaUrl: '',
      hashtags: [],
      mentions: [],
      taggedUsers: [],
      location: '',
      visibility: 'public',
      allowComments: true,
      allowSharing: true
    });
    setCurrentStep('content');
    setDate(undefined);
    setIsScheduling(false);
  };

  const nextStep = () => {
    if (currentStep === 'content') setCurrentStep('metadata');
    else if (currentStep === 'metadata') setCurrentStep('settings');
    else if (currentStep === 'settings') setCurrentStep('preview');
  };

  const prevStep = () => {
    if (currentStep === 'preview') setCurrentStep('settings');
    else if (currentStep === 'settings') setCurrentStep('metadata');
    else if (currentStep === 'metadata') setCurrentStep('content');
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 "
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
        >
          <motion.div
            className="relative bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-scroll shadow-xl"
            variants={modalVariants}
          >
            <div className="border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                {currentStep === 'content' && 'Create Post'}
                {currentStep === 'metadata' && 'Tagging & Metadata'}
                {currentStep === 'settings' && 'Post Settings'}
                {currentStep === 'preview' && 'Preview & Post'}
              </h2>
              <button 
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <div className="p-6 flex-1 overflow-y-auto">
                {/* Step Indicator */}
                <div className="flex justify-between mb-6">
                  {(['content', 'metadata', 'settings', 'preview'] as FormStep[]).map((step, index) => (
                    <div key={step} className="flex flex-col items-center">
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          currentStep === step 
                            ? 'bg-blue-500 text-white' 
                            : index < (['content', 'metadata', 'settings', 'preview'].indexOf(currentStep))
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className="text-xs mt-1 capitalize">{step}</span>
                    </div>
                  ))}
                </div>

                {/* Step 1: Content */}
                {currentStep === 'content' && (
                  <div className="space-y-6">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Edit size={18} className="text-gray-600" />
                        <h3 className="font-medium text-gray-800">Post Content</h3>
                      </div>
                      
                      <MDEditor
                        value={postData.content}
                        onChange={(value) => setPostData(prev => ({ ...prev, content: value || '' }))}
                        preview="edit"
                        height={200}
                        className="border rounded-lg"
                      />

                     
                      
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          <Smile size={16} /> Add Emoji
                        </button>
                        {showEmojiPicker && (
                          <div className="absolute z-10 mt-2">
                            <EmojiPicker onEmojiClick={addEmoji} width={300} height={350} />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <ImageIcon size={18} className="text-gray-600" />
                        <h3 className="font-medium text-gray-800">Cover Image <span className="text-xs text-gray-500">(optional)</span></h3>
                      </div>
                      

                      
                      <div className="flex gap-3">
                        <button 
                          type="button" 
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <ImageIcon size={16} /> Click to Upload Image
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) => handleFileChange(e) }
                            accept="image/*"
                            className="hidden"
                          />
                        </button>
                        {uploadProgress > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{Math.round(uploadProgress)}%</span>
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500" 
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}                       
                      </div>
                      {mediaPreview && (
                          <div className="relative w-full pt-4 h-48 rounded-lg overflow-hidden">
                            <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                  </div>
                )}

                {/* Step 2: Metadata */}
                {currentStep === 'metadata' && (
                  <div className="space-y-6">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Hash size={18} className="text-gray-600" />
                        <h3 className="font-medium text-gray-800">Hashtags</h3>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {postData.hashtags.map(tag => (
                          <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm">
                            {tag}
                            <button 
                              type="button" 
                              onClick={() => removeHashtag(tag)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                      
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Add hashtags (press Enter to add)"
                        onKeyDown={addHashtag}
                      />
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <UserPlus size={18} className="text-gray-600" />
                        <h3 className="font-medium text-gray-800">Tag People</h3>
                      </div>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Search users to tag"
                      />
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin size={18} className="text-gray-600" />
                        <h3 className="font-medium text-gray-800">Location</h3>
                      </div>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Add location"
                        value={postData.location}
                        onChange={(e) => setPostData(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Settings */}
                {currentStep === 'settings' && (
                  <div className="space-y-6">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Globe size={18} className="text-gray-600" />
                        <h3 className="font-medium text-gray-800">Visibility</h3>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setPostData(prev => ({ ...prev, visibility: 'public' }))}
                          className={`p-2 rounded border ${
                            postData.visibility === 'public' 
                              ? 'border-blue-500 bg-blue-50 text-blue-600' 
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <Globe size={16} className="mx-auto mb-1" />
                          <span className="text-sm">Public</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPostData(prev => ({ ...prev, visibility: 'friends' }))}
                          className={`p-2 rounded border ${
                            postData.visibility === 'friends' 
                              ? 'border-blue-500 bg-blue-50 text-blue-600' 
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <Users size={16} className="mx-auto mb-1" />
                          <span className="text-sm">Friends</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPostData(prev => ({ ...prev, visibility: 'private' }))}
                          className={`p-2 rounded border ${
                            postData.visibility === 'private' 
                              ? 'border-blue-500 bg-blue-50 text-blue-600' 
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <Lock size={16} className="mx-auto mb-1" />
                          <span className="text-sm">Private</span>
                        </button>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar size={18} className="text-gray-600" />
                        <h3 className="font-medium text-gray-800">Schedule Post</h3>
                      </div>
                      
                      <div className="flex items-center gap-3 mb-3">
                        <input
                          type="checkbox"
                          id="schedule-post"
                          checked={isScheduling}
                          onChange={(e) => setIsScheduling(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="schedule-post" className="text-sm text-gray-700">
                          Schedule for later
                        </label>
                      </div>

                      {isScheduling && (
                        <div className="mt-2">
                          <input
                            type="datetime-local"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            onChange={(e) => setDate(new Date(e.target.value))}
                          />
                        </div>
                      )}
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageSquare size={18} className="text-gray-600" />
                        <h3 className="font-medium text-gray-800">Comment Settings</h3>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="allow-comments"
                          checked={postData.allowComments}
                          onChange={(e) => setPostData(prev => ({ ...prev, allowComments: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="allow-comments" className="text-sm text-gray-700">
                          Allow Comments
                        </label>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Repeat size={18} className="text-gray-600" />
                        <h3 className="font-medium text-gray-800">Sharing Settings</h3>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="allow-sharing"
                          checked={postData.allowSharing}
                          onChange={(e) => setPostData(prev => ({ ...prev, allowSharing: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="allow-sharing" className="text-sm text-gray-700">
                          Allow Sharing
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Preview */}
                {currentStep === 'preview' && (
                  <div className="space-y-6">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Eye size={18} className="text-gray-600" />
                        <h3 className="font-medium text-gray-800">Post Preview</h3>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full bg-gray-200">
                            {user?.profilePicture ? (
                              <img src={user.profilePicture} alt="User" className="w-full h-full rounded-full" />
                            ) : (
                              <div className="w-full h-full rounded-full bg-gray-400"></div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{user?.fullName}</p>
                            <p className="text-xs text-gray-500">
                              {postData.visibility === 'public' && <Globe size={12} className="inline mr-1" />}
                              {postData.visibility === 'friends' && <Users size={12} className="inline mr-1" />}
                              {postData.visibility === 'private' && <Lock size={12} className="inline mr-1" />}
                              {postData.visibility}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4" dangerouslySetInnerHTML={{ __html: postData.content }} />

                        {mediaPreview && (
                          <div className="relative w-full pt-4 h-48 rounded-lg overflow-hidden">
                            <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 mb-4">
                          {postData.hashtags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                              {tag}
                            </span>
                          ))}
                        </div>

                        {postData.location && (
                          <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                            <MapPin size={14} /> {postData.location}
                          </div>
                        )}

                        <div className="border-t pt-3 text-sm text-gray-500">
                          <p>{postData.allowComments ? 'Comments enabled' : 'Comments disabled'}</p>
                          <p>{postData.allowSharing ? 'Sharing enabled' : 'Sharing disabled'}</p>
                          {isScheduling && date && (
                            <p>Scheduled for: {format(date, "PPPpp")}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Edit size={18} className="text-gray-600" />
                        <h3 className="font-medium text-gray-800">Finalize</h3>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">
                        Review your post before publishing. You can go back to edit any section.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 p-4 flex justify-between">
                {currentStep !== 'content' ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Back
                  </button>
                ) : (
                  <div></div>
                )}

                {currentStep !== 'preview' ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                  >
                    Continue
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep('content')}
                      className="flex items-center gap-1 px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      <Edit size={16} /> Edit Post
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                    >
                      {isScheduling ? 'Schedule Post' : <span>
                        {loading ? <Loader2 className="animate-spin" size={16} /> : 'Post'}
                      </span>}
                    </button>
                  </div>
                )}
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreatePost;