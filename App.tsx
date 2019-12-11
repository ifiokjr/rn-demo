import React, { FC, useState, useEffect } from 'react';
import { createAppContainer, NavigationInjectedProps } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { StyleSheet, View, ViewProps, SafeAreaView, ListRenderItem } from 'react-native';
import { Facebook } from 'react-content-loader/native';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { ListItem, Text } from 'react-native-elements';

const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const loadPosts = async (): Promise<PostsResponse[]> => {
  const response = await fetch('http://jsonplaceholder.typicode.com/posts');
  return response.json();
};

const loadUser = async (id: number): Promise<UserResponse> => {
  const response = await fetch(`http://jsonplaceholder.typicode.com/users/${id.toString()}`);
  return response.json();
};

enum Screen {
  Details = '/details',
  Posts = '/posts',
}

// Show the loading screens for longer.
const FAKE_DELAY = 2000;

const PostsScreen: FC<NavigationInjectedProps> = ({ navigation }) => {
  const [posts, setPosts] = useState<PostsResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { navigate } = navigation;

  useEffect(() => {
    loadPosts()
      .then(p => {
        setPosts(p);
        // Fake delay length.
        return delay(FAKE_DELAY);
      })
      .then(() => {
        setLoading(false);
      });
    return () => {};
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <Facebook />
        <Facebook />
        <Facebook />
        <Facebook />
        <Facebook />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container]}>
      <FlatList
        keyExtractor={item => item.id.toString()}
        data={posts}
        renderItem={({ item }) => (
          <ListItem
            title={item.title}
            titleProps={{ numberOfLines: 1 }}
            subtitle={item.body}
            subtitleProps={{ numberOfLines: 1 }}
            leftAvatar={{
              source: {
                uri: `https://source.unsplash.com/random/100x75?item.id=${item.id}`,
              },
              title: 'YES',
            }}
            bottomDivider
            chevron
            onPress={() => navigate(Screen.Details, item)}
          />
        )}
      />
    </SafeAreaView>
  );
};

const noUser: UserResponse = {
  id: 0,
  name: 'No User',
  username: 'no.user',
  email: 'no.user',
  address: {
    street: '',
    suite: '',
    city: '',
    zipcode: '',
    geo: {
      lat: '',
      lng: '',
    },
  },
  phone: '',
  website: '',
  company: {
    name: '',
    catchPhrase: '',
    bs: '',
  },
};

const DetailsScreen: FC<NavigationInjectedProps<PostsResponse>> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserResponse>(noUser);
  const { getParam } = navigation;
  const userId = getParam('userId');

  useEffect(() => {
    loadUser(userId)
      .then(u => {
        console.log('user', u);
        setUser(u);
        return delay(FAKE_DELAY);
      })
      .then(() => setLoading(false))
      .catch(() => {
        setLoading(false);
      });
  }, [userId]);

  const showUser = () => {
    return (
      <ListItem
        title={user.name}
        subtitle={user.username}
        leftAvatar={{
          source: { uri: 'https://i.pravatar.cc/150' },
          title: 'Random image for the clout',
        }}
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container]}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text h3 style={{ paddingBottom: 40 }}>
          {getParam('title', 'No title found')}
        </Text>
        <Text style={{ paddingBottom: 40 }}>{getParam('body', 'No text found')}</Text>
        {loading ? <Facebook /> : showUser()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'space-between',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  detailsContainer: {
    paddingHorizontal: 10,
  },
});

const MainNavigator = createStackNavigator({
  [Screen.Posts]: { screen: PostsScreen, navigationOptions: { title: 'Posts' } },
  [Screen.Details]: {
    screen: DetailsScreen,
    navigationOptions: ({ navigation }) => ({
      title: `${navigation.getParam('title', 'Details Screen')}`,
    }),
  },
});

const App = createAppContainer(MainNavigator);

interface UserResponse {
  id: number;
  name: string;
  username: string;
  email: string;
  address: Address;
  phone: string;
  website: string;
  company: Company;
}

interface Company {
  name: string;
  catchPhrase: string;
  bs: string;
}

interface Address {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: Geo;
}

interface Geo {
  lat: string;
  lng: string;
}

interface PostsResponse {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export default App;
