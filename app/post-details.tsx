import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  Image, 
  TextInput,
  TouchableOpacity,
  FlatList
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Colors from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface Comment {
  id: string;
  author: string;
  authorPhoto: string;
  text: string;
  timestamp: Date;
}

export default function PostDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(3);
  const [commentText, setCommentText] = useState('');
  
  // Mock post data - in a real app, fetch this from Firebase based on id
  const post = {
    id: id || '1',
    author: 'John',
    authorPhoto: 'https://placekitten.com/100/100',
    title: 'Family Picnic',
    content: 'Had a great time at the park today! Carson got on the slides and he really enjoyed the carousel. The weather was perfect and everyone had a blast. We should definitely plan another picnic soon.',
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=3869&auto=format&fit=crop',
    timestamp: new Date(),
    attachments: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=3869&auto=format&fit=crop' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=3870&auto=format&fit=crop' }
    ]
  };
  
  // Mock comments
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: 'Sarah',
      authorPhoto: 'https://placekitten.com/101/101',
      text: 'Looks like fun! Wish I could have been there.',
      timestamp: new Date(Date.now() - 3600000) // 1 hour ago
    },
    {
      id: '2',
      author: 'Mike',
      authorPhoto: 'https://placekitten.com/102/102',
      text: 'Great photos! Carson looks so happy.',
      timestamp: new Date(Date.now() - 7200000) // 2 hours ago
    }
  ]);
  
  const toggleLike = () => {
    if (liked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setLiked(prev => !prev);
  };
  
  const addComment = () => {
    if (!commentText.trim()) return;
    
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      author: 'You',
      authorPhoto: 'https://placekitten.com/105/105',
      text: commentText,
      timestamp: new Date()
    };
    
    setComments(prev => [newComment, ...prev]);
    setCommentText('');
  };
  
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  };
  
  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <Image source={{ uri: item.authorPhoto }} style={styles.commentAvatar} />
      <View style={styles.commentContent}>
        <Text style={styles.commentAuthor}>{item.author}</Text>
        <Text style={styles.commentText}>{item.text}</Text>
        <Text style={styles.commentTime}>{formatDate(item.timestamp)}</Text>
      </View>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.ORANGE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          <View style={styles.headerRight} />
        </View>
        
        {/* Post content */}
        <View style={styles.postContainer}>
          <View style={styles.postHeader}>
            <Image source={{ uri: post.authorPhoto }} style={styles.authorPhoto} />
            <View style={styles.postHeaderText}>
              <Text style={styles.authorName}>{post.author}</Text>
              <Text style={styles.postTime}>{formatDate(post.timestamp)}</Text>
            </View>
          </View>
          
          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postContent}>{post.content}</Text>
          
          {post.image && (
            <Image 
              source={{ uri: post.image }} 
              style={styles.postImage}
              resizeMode="cover"
            />
          )}
          
          {/* Attachments */}
          {post.attachments && post.attachments.length > 0 && (
            <View style={styles.attachmentsContainer}>
              <Text style={styles.attachmentsTitle}>Attachments</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {post.attachments.map((attachment, index) => (
                  <Image 
                    key={index} 
                    source={{ uri: attachment.url }} 
                    style={styles.attachmentImage} 
                  />
                ))}
              </ScrollView>
            </View>
          )}
          
          {/* Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={toggleLike}
            >
              <Ionicons 
                name={liked ? "heart" : "heart-outline"} 
                size={24} 
                color={liked ? Colors.ORANGE : Colors.LIGHT_GRAY} 
              />
              <Text style={styles.actionText}>{likeCount} Likes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={24} color={Colors.LIGHT_GRAY} />
              <Text style={styles.actionText}>{comments.length} Comments</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Comments section */}
        <View style={styles.commentsContainer}>
          <Text style={styles.commentsTitle}>Comments</Text>
          
          {/* Add comment */}
          <View style={styles.addCommentContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              placeholderTextColor={Colors.LIGHT_GRAY}
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity 
              style={[
                styles.postCommentButton,
                !commentText.trim() && styles.postCommentButtonDisabled
              ]}
              onPress={addComment}
              disabled={!commentText.trim()}
            >
              <Text style={styles.postCommentButtonText}>Post</Text>
            </TouchableOpacity>
          </View>
          
          {/* Comments list */}
          <FlatList
            data={comments}
            renderItem={renderComment}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.commentSeparator} />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BLACK,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.NAVY,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.WHITE,
  },
  headerRight: {
    width: 24, // For alignment
  },
  postContainer: {
    padding: 20,
    borderBottomWidth: 6,
    borderBottomColor: Colors.NAVY,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  authorPhoto: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  postHeaderText: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.WHITE,
  },
  postTime: {
    fontSize: 12,
    color: Colors.LIGHT_GRAY,
    marginTop: 2,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.ORANGE,
    marginBottom: 10,
  },
  postContent: {
    fontSize: 16,
    color: Colors.WHITE,
    lineHeight: 24,
    marginBottom: 15,
  },
  postImage: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: Colors.LIGHT_GRAY + '20',
  },
  attachmentsContainer: {
    marginBottom: 15,
  },
  attachmentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.WHITE,
    marginBottom: 10,
  },
  attachmentImage: {
    width: 120,
    height: 90,
    borderRadius: 8,
    marginRight: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.NAVY,
    paddingTop: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    color: Colors.LIGHT_GRAY,
    marginLeft: 8,
    fontSize: 14,
  },
  commentsContainer: {
    padding: 20,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.WHITE,
    marginBottom: 15,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
    backgroundColor: Colors.NAVY,
    borderRadius: 12,
    padding: 10,
  },
  commentInput: {
    flex: 1,
    minHeight: 40,
    color: Colors.WHITE,
    fontSize: 14,
  },
  postCommentButton: {
    backgroundColor: Colors.ORANGE,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  postCommentButtonDisabled: {
    backgroundColor: Colors.LIGHT_GRAY,
    opacity: 0.5,
  },
  postCommentButtonText: {
    color: Colors.WHITE,
    fontWeight: 'bold',
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
    backgroundColor: Colors.NAVY,
    borderRadius: 12,
    padding: 12,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.WHITE,
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: Colors.WHITE,
    marginBottom: 6,
  },
  commentTime: {
    fontSize: 12,
    color: Colors.LIGHT_GRAY,
  },
  commentSeparator: {
    height: 15,
  },
}); 