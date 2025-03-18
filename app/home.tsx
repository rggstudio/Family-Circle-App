import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Platform,
  Dimensions,
  Animated,
  Modal,
  Alert,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import format from 'date-fns/format';
import { useAuth } from '../context/AuthContext';
import SideMenu from '../components/SideMenu';
import Colors from '../constants/Colors';

interface FamilyMember {
  id: string;
  name: string;
  photo: string;
}

interface Post {
  id: string;
  author: string;
  authorPhoto: string;
  title: string;
  content: string;
  image?: string;
  timestamp: Date;
  likes: number;
  comments: number;
  isPinned: boolean;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  category: 'workout' | 'meeting' | 'chore' | 'personal';
}

// New interface for events
interface Event {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  category: 'family' | 'work' | 'personal' | 'activity';
  color: string;
  location?: string;
  participants: {
    id: string;
    name: string;
    photo: string;
  }[];
  icon: keyof typeof Ionicons.glyphMap;
  creatorId: string; // To determine if current user can edit
}

// Temporary mock data - will be replaced with real data from Firebase
const MOCK_FAMILY_MEMBERS: FamilyMember[] = [
  { id: '1', name: 'John', photo: 'https://placekitten.com/100/100' },
  { id: '2', name: 'Sarah', photo: 'https://placekitten.com/101/101' },
  { id: '3', name: 'Mike', photo: 'https://placekitten.com/102/102' },
  { id: '4', name: 'Lisa', photo: 'https://placekitten.com/103/103' },
  { id: '5', name: 'Tom', photo: 'https://placekitten.com/104/104' },
];

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    author: 'John',
    authorPhoto: 'https://placekitten.com/100/100',
    title: 'Family Picnic',
    content: 'Had a great time at the park today! Carson got on the slides and he really enjoyed the carousel.',
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=3869&auto=format&fit=crop',
    timestamp: new Date(),
    likes: 3,
    comments: 10,
    isPinned: true,
  },
  {
    id: '2',
    author: 'Sarah',
    authorPhoto: 'https://placekitten.com/101/101',
    title: 'New Recipe',
    content: 'I tried a new pasta recipe tonight. Everyone loved it!',
    image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=3870&auto=format&fit=crop',
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
    likes: 8,
    comments: 2,
    isPinned: false,
  },
  {
    id: '3',
    author: 'Mike',
    authorPhoto: 'https://placekitten.com/102/102',
    title: 'Weekend Plans',
    content: 'Who wants to go hiking this weekend? The weather looks perfect!',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=3870&auto=format&fit=crop',
    timestamp: new Date(Date.now() - 172800000), // 2 days ago
    likes: 5,
    comments: 12,
    isPinned: false,
  },
];

const MOCK_TASKS: Task[] = [
  {
    id: '1',
    title: 'Work Out',
    completed: false,
    category: 'workout',
  },
  {
    id: '2',
    title: 'Daily Meeting',
    completed: false,
    category: 'meeting',
  },
  {
    id: '3',
    title: 'Clean Room',
    completed: true,
    category: 'chore',
  },
  {
    id: '4',
    title: 'Call Mom',
    completed: false,
    category: 'personal',
  },
  {
    id: '5',
    title: 'Do Homework',
    completed: false,
    category: 'personal',
  },
];

// Mock events data
const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Breakfast',
    startTime: new Date(new Date().setHours(9, 30, 0, 0)),
    endTime: new Date(new Date().setHours(10, 0, 0, 0)),
    category: 'family',
    color: '#fb8500',
    location: '34 Carson Lane',
    participants: [
      { id: '1', name: 'John', photo: 'https://placekitten.com/100/100' },
      { id: '2', name: 'Sarah', photo: 'https://placekitten.com/101/101' },
    ],
    icon: 'restaurant-outline',
    creatorId: '1',
  },
  {
    id: '2',
    title: 'School Time',
    startTime: new Date(new Date().setHours(10, 0, 0, 0)),
    endTime: new Date(new Date().setHours(14, 0, 0, 0)),
    category: 'work',
    color: '#0077b6',
    location: '45 Wood Street',
    participants: [
      { id: '3', name: 'Sam', photo: 'https://placekitten.com/102/102' },
      { id: '4', name: 'David', photo: 'https://placekitten.com/103/103' },
    ],
    icon: 'school-outline',
    creatorId: '2',
  },
  {
    id: '3',
    title: 'Soccer Practice',
    startTime: new Date(new Date().setHours(15, 0, 0, 0)),
    endTime: new Date(new Date().setHours(16, 30, 0, 0)),
    category: 'activity',
    color: '#8338ec',
    location: 'City Field',
    participants: [
      { id: '1', name: 'John', photo: 'https://placekitten.com/100/100' },
      { id: '5', name: 'Mike', photo: 'https://placekitten.com/104/104' },
    ],
    icon: 'football-outline',
    creatorId: '5',
  },
];

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentDate] = useState(new Date());
  const [familyName, setFamilyName] = useState('The Smith Family Circle');
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-300)).current;
  
  // Add state for notification badges
  const [unreadEvents, setUnreadEvents] = useState(3);
  const [unreadMessages, setUnreadMessages] = useState(5);

  // Add state for event options modal
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);

  // Extract first name only
  const getFirstName = (fullName?: string) => {
    if (!fullName) return "";
    return fullName.split(' ')[0];
  };

  const toggleMenu = () => {
    if (menuVisible) {
      // Close menu
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setMenuVisible(false));
    } else {
      // Open menu
      setMenuVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const renderMemberAvatar = ({ item }: { item: FamilyMember }) => (
    <TouchableOpacity 
      style={styles.memberAvatar}
      onPress={() => router.push({
        pathname: '/profile/[id]',
        params: { id: item.id }
      })}
    >
      <Image source={{ uri: item.photo }} style={styles.avatarImage} />
    </TouchableOpacity>
  );

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity 
      style={styles.postCard}
      onPress={() => router.push({
        pathname: '/post-details',
        params: { id: item.id }
      })}
    >
      <View style={styles.postHeader}>
        <Image source={{ uri: item.authorPhoto }} style={styles.authorPhoto} />
        <View style={styles.postHeaderText}>
          <Text style={styles.authorName}>{item.author}</Text>
          <Text style={styles.postTime}>
            {format(item.timestamp, 'MMM d, yyyy')}
          </Text>
        </View>
        {item.isPinned && (
          <View style={styles.pinnedBadge}>
            <Ionicons name="pin" size={14} color={Colors.ORANGE} />
            <Text style={styles.pinnedText}>Pinned</Text>
          </View>
        )}
      </View>
      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postContent} numberOfLines={2}>{item.content}</Text>
      {item.image && (
        <Image 
          source={{ uri: item.image }} 
          style={styles.postImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart-outline" size={20} color={Colors.ORANGE} />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color={Colors.ORANGE} />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderTask = ({ item }: { item: Task }) => {
    let iconName: keyof typeof Ionicons.glyphMap = 'checkmark-circle-outline';
    
    switch (item.category) {
      case 'workout':
        iconName = 'fitness-outline';
        break;
      case 'meeting':
        iconName = 'people-outline';
        break;
      case 'chore':
        iconName = 'home-outline';
        break;
      case 'personal':
        iconName = 'person-outline';
        break;
    }
    
    return (
      <View style={styles.taskItem}>
        <TouchableOpacity 
          style={[
            styles.taskCheckbox, 
            item.completed && styles.taskCompleted
          ]}
        >
          <Ionicons 
            name={item.completed ? 'checkmark-circle' : 'checkmark-circle-outline'} 
            size={24} 
            color={item.completed ? Colors.ORANGE : Colors.LIGHT_GRAY} 
          />
        </TouchableOpacity>
        <View style={styles.taskContent}>
          <Text 
            style={[
              styles.taskTitle,
              item.completed && styles.taskTitleCompleted
            ]}
          >
            {item.title}
          </Text>
        </View>
        <Ionicons name={iconName} size={20} color={Colors.ORANGE} />
      </View>
    );
  };

  // Filter to show max 3 incomplete tasks, or completed tasks if none incomplete
  const getFilteredTasks = () => {
    const incompleteTasks = MOCK_TASKS.filter(task => !task.completed);
    const completedTasks = MOCK_TASKS.filter(task => task.completed);
    
    if (incompleteTasks.length > 0) {
      return incompleteTasks.slice(0, 3);
    } else {
      return completedTasks.slice(0, 3);
    }
  };

  // Function to handle opening the options modal
  const handleEventOptions = (event: Event) => {
    setSelectedEvent(event);
    setOptionsModalVisible(true);
  };
  
  // Function to handle responding "no" to an event
  const handleDeclineEvent = () => {
    if (selectedEvent) {
      Alert.alert('Response Updated', 'You have declined this event.');
      // In a real app, you would update this in Firebase
      setOptionsModalVisible(false);
    }
  };
  
  // Function to handle setting a reminder
  const handleSetReminder = () => {
    if (selectedEvent) {
      Alert.alert('Reminder', 'This would open the device alarm app in a real implementation.');
      setOptionsModalVisible(false);
    }
  };
  
  // Function to handle editing an event (only for creator)
  const handleEditEvent = () => {
    if (selectedEvent) {
      router.push({
        pathname: '/tasks',
        params: { id: selectedEvent.id }
      });
      setOptionsModalVisible(false);
    }
  };
  
  // Function to view event details
  const handleViewEventDetails = (event: Event) => {
    router.push({
      pathname: '/events',
      params: { id: event.id }
    });
  };

  const formatTimeShort = (date: Date) => {
    // Format time to show 'A' or 'P' instead of 'AM' or 'PM'
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'P' : 'A';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}${ampm}`;
  };

  const renderEvent = ({ item }: { item: Event }) => {
    const timeRange = `${formatTimeShort(item.startTime)} - ${formatTimeShort(item.endTime)}`;
    let categoryText = '';
    
    switch(item.category) {
      case 'family':
        categoryText = 'Family';
        break;
      case 'work':
        categoryText = 'Work';
        break;
      case 'personal':
        categoryText = 'Personal';
        break;
      case 'activity':
        categoryText = 'Activity';
        break;
      default:
        categoryText = 'Event';
    }
    
    return (
      <View style={styles.eventTimeContainer}>
        <View style={styles.eventTimeMarker}>
          <Text style={styles.eventTimeText}>
            {formatTimeShort(item.startTime)}
          </Text>
        </View>
        
        <View style={[styles.eventCard, { backgroundColor: item.color }]}>
          <View style={styles.eventCardHeader}>
            <View style={styles.eventCardIconContainer}>
              <Ionicons name={item.icon} size={20} color="white" />
            </View>
            <TouchableOpacity 
              style={styles.eventTitleContainer}
              onPress={() => handleViewEventDetails(item)}
            >
              <Text style={styles.eventCardTitle}>{item.title}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleEventOptions(item)}>
              <Ionicons name="ellipsis-horizontal" size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.eventCardDetails}>
            <Text style={styles.eventCardTimeRange}>{timeRange}</Text>
            <Text style={styles.eventCardCategory}>• {categoryText}</Text>
          </View>
          
          <View style={styles.eventCardFooter}>
            <View style={styles.eventParticipants}>
              {item.participants.map((participant, index) => (
                <Image 
                  key={participant.id} 
                  source={{ uri: participant.photo }} 
                  style={[
                    styles.participantAvatar,
                    { marginLeft: index > 0 ? -10 : 0 }
                  ]} 
                />
              ))}
            </View>
            
            {item.location && (
              <View style={styles.eventLocation}>
                <Ionicons name="location-outline" size={14} color="white" />
                <Text style={styles.eventLocationText}>{item.location}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Side Menu */}
      {menuVisible && (
        <Animated.View 
          style={[
            styles.menuContainer,
            { left: slideAnim }
          ]}
        >
          <SideMenu onClose={toggleMenu} />
        </Animated.View>
      )}

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleMenu}>
            <Ionicons name="menu" size={28} color={Colors.ORANGE} />
          </TouchableOpacity>
          <Text style={styles.familyName}>{familyName}</Text>
          <TouchableOpacity onPress={() => router.push({
            pathname: '/notifications'
          })}>
            <Ionicons name="notifications" size={24} color={Colors.ORANGE} />
          </TouchableOpacity>
        </View>

        {/* Date and Welcome */}
        <View style={styles.welcomeSection}>
          <Text style={styles.dateText}>
            {format(currentDate, 'EEEE, MMMM d yyyy')}
          </Text>
          <Text style={styles.welcomeText}>
            Welcome Back{user?.displayName ? ", " + getFirstName(user.displayName) : ""}!
          </Text>
        </View>

        {/* Family Members */}
        <View style={styles.membersSection}>
          <FlatList
            data={MOCK_FAMILY_MEMBERS}
            renderItem={renderMemberAvatar}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.membersList}
          />
        </View>

        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Family Feed */}
          <View style={styles.feedSection}>
            <Text style={styles.sectionTitle}>The Family Feed</Text>
            <FlatList
              data={MOCK_POSTS}
              renderItem={renderPost}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.feedList}
              snapToInterval={280}
              decelerationRate="fast"
              ItemSeparatorComponent={() => <View style={{ width: 15 }} />}
            />
          </View>

          {/* Daily Tasks */}
          <View style={styles.tasksSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Daily Tasks</Text>
              <TouchableOpacity onPress={() => router.push({
                pathname: '/tasks'
              })}>
                <Text style={styles.viewAllLink}>View All Tasks</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tasksList}>
              {getFilteredTasks().map(task => (
                <View key={task.id}>
                  {renderTask({ item: task })}
                </View>
              ))}
            </View>
          </View>

          {/* Upcoming Events */}
          <View style={styles.eventsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Events</Text>
              <TouchableOpacity onPress={() => router.push({
                pathname: '/events'
              })}>
                <Text style={styles.viewAllLink}>View Calendar</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.eventsList}>
              {MOCK_EVENTS.map(event => (
                <View key={event.id} style={{ marginBottom: 10 }}>
                  {renderEvent({ item: event })}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="home" size={24} color={Colors.ORANGE} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => router.push({
              pathname: '/calendar'
            })}
          >
            <View>
              <Ionicons name="calendar" size={24} color={Colors.WHITE} />
              {unreadEvents > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadEvents}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => router.push({
              pathname: '/chat'
            })}
          >
            <View>
              <Ionicons name="chatbubbles" size={24} color={Colors.WHITE} />
              {unreadMessages > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadMessages}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => router.push({
              pathname: '/create-post'
            })}
          >
            <Ionicons name="add-circle" size={24} color={Colors.WHITE} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Overlay when menu is open */}
      {menuVisible && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={toggleMenu}
        />
      )}

      {/* Options Modal for Events */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={optionsModalVisible}
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setOptionsModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Event Options</Text>
            
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={handleDeclineEvent}
            >
              <Ionicons name="close-circle-outline" size={24} color={Colors.ORANGE} />
              <Text style={styles.modalOptionText}>Decline Event</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={handleSetReminder}
            >
              <Ionicons name="alarm-outline" size={24} color={Colors.ORANGE} />
              <Text style={styles.modalOptionText}>Set Reminder</Text>
            </TouchableOpacity>
            
            {selectedEvent && selectedEvent.creatorId === user?.uid && (
              <TouchableOpacity 
                style={styles.modalOption}
                onPress={handleEditEvent}
              >
                <Ionicons name="create-outline" size={24} color={Colors.ORANGE} />
                <Text style={styles.modalOptionText}>Edit Event</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.modalOption, styles.modalCloseOption]}
              onPress={() => setOptionsModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const { width, height } = Dimensions.get('window');
const MENU_WIDTH = width * 0.9;
const POST_WIDTH = width * 0.7;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BLACK,
  },
  mainContent: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.NAVY,
  },
  familyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.WHITE,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  dateText: {
    fontSize: 14,
    color: Colors.LIGHT_GRAY,
  },
  welcomeText: {
    fontSize: 22, // Reduced from 24px to 22px
    fontWeight: 'bold',
    color: Colors.WHITE,
    marginTop: 5,
  },
  membersSection: {
    marginVertical: 10,
  },
  membersList: {
    paddingHorizontal: 20,
  },
  memberAvatar: {
    marginRight: 15,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.ORANGE,
  },
  feedSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.WHITE,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  feedList: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  postCard: {
    backgroundColor: Colors.NAVY,
    borderRadius: 15,
    padding: 12,
    width: POST_WIDTH,
    maxHeight: 400,
    overflow: 'hidden',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  authorPhoto: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  postHeaderText: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.WHITE,
  },
  postTime: {
    fontSize: 10,
    color: Colors.LIGHT_GRAY,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.ORANGE,
    marginBottom: 4,
  },
  postContent: {
    fontSize: 12,
    color: Colors.LIGHT_GRAY,
    marginBottom: 8,
  },
  postImage: {
    width: '100%',
    height: 170,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: Colors.LIGHT_GRAY + '20',
  },
  postActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  actionText: {
    color: Colors.WHITE,
    marginLeft: 4,
    fontSize: 12,
  },
  tasksSection: {
    flex: 1,
    marginBottom: 20,
  },
  tasksList: {
    paddingHorizontal: 20,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.NAVY,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  taskCheckbox: {
    marginRight: 15,
  },
  taskCompleted: {
    opacity: 0.7,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: Colors.WHITE,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.NAVY,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.BLACK,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    marginBottom: -1, // Remove any gap at bottom
  },
  navItem: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    width: MENU_WIDTH,
    height: '100%',
    backgroundColor: Colors.NAVY,
    zIndex: 100,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 50,
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(252, 163, 17, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  pinnedText: {
    color: Colors.ORANGE,
    fontSize: 10,
    marginLeft: 3,
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: Colors.ORANGE,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.BLACK,
  },
  badgeText: {
    color: Colors.WHITE,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  viewAllLink: {
    color: Colors.ORANGE,
    fontSize: 14,
    fontWeight: '500',
  },
  eventsSection: {
    marginBottom: 30,
  },
  eventsList: {
    paddingHorizontal: 20,
  },
  eventTimeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  eventTimeMarker: {
    width: 50,
    alignItems: 'center',
    marginRight: 10,
  },
  eventTimeText: {
    fontSize: 12,
    color: Colors.LIGHT_GRAY,
    textAlign: 'center',
  },
  eventCard: {
    flex: 1,
    borderRadius: 15,
    padding: 12,
    overflow: 'hidden',
  },
  eventCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  eventCardIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  eventCardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.WHITE,
  },
  eventCardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventCardTimeRange: {
    fontSize: 12,
    color: Colors.WHITE,
    opacity: 0.8,
  },
  eventCardCategory: {
    fontSize: 12,
    color: Colors.WHITE,
    opacity: 0.8,
    marginLeft: 5,
  },
  eventCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventParticipants: {
    flexDirection: 'row',
  },
  participantAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'white',
  },
  eventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventLocationText: {
    fontSize: 11,
    color: Colors.WHITE,
    marginLeft: 2,
  },
  eventTitleContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.NAVY,
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.WHITE,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalOptionText: {
    color: Colors.WHITE,
    fontSize: 16,
    marginLeft: 15,
  },
  modalCloseOption: {
    justifyContent: 'center',
    marginTop: 10,
    borderBottomWidth: 0,
  },
  modalCloseText: {
    color: Colors.ORANGE,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 