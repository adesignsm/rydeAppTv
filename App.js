import { useState, useEffect } from 'react';
import { Image, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { LogBox } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getDatabase , ref, get, child, update, onValue } from 'firebase/database';
import * as Device from 'expo-device';

const firebaseConfig = {
    apiKey: 'AIzaSyDMaoMd9JHWrnG2_qlskyaq4nFZN88tmcY',
    authDomain: 'project-id.firebaseapp.com',
    databaseURL: 'https://ryde-env-default-rtdb.firebaseio.com',
    projectId: 'ryde-env',
    storageBucket: 'ryde-env.appspot.com',
    messagingSenderId: 'sender-id',
    appId: 'app-id',
    measurementId: 'G-measurement-id',
};

import ENERGIZE from './Media/energize.mp4';
import FOCUS from './Media/focus.mp4';
import RELAX from './Media/relax.mp4';

import ENERGIZE_GRAPHIC from './Media/energize_graphic.jpg';
import FOCUS_GRAPHIC from './Media/focus_graphic_revised.jpg';
import RELAX_GRAPHIC from './Media/relax_graphic_revised.jpg';

const {width, height} = Dimensions.get('window');

LogBox.ignoreLogs([
  "EventEmitter.removeListener('url', ...): Method has been deprecated. Please instead use `remove()` on the subscription returned by `EventEmitter.addListener`.",
  "ViewPropTypes will be removed from React Native. Migrate to ViewPropTypes exported from 'deprecated-react-native-prop-types'.",
]);

LogBox.ignoreLogs(["Warnings..."]);
LogBox.ignoreAllLogs();

export default function App() {
  const [showEnergizeVideo, setShowEnergizeVideo] = useState(false);
  const [showFocusVideo, setShowFocusVideo] = useState(false);
  const [showRelaxVideo, setShowRelaxVideo] = useState(false);

  const [isTvOne, setIsTvOne] = useState(false);
  const [isTvTwo, setIsTvTwo] = useState(false);
  const [isTvThree, setIsTvThree] = useState(false);

  const [tvVolume, setTvVolume] = useState(0.3);

  useEffect(() => {
    console.log(Device.deviceName);
    if (Device.deviceName === 'ENERGIZE') {
      setIsTvOne(true)
    } else if (Device.deviceName === 'FOCUS') {
      setIsTvTwo(true);
    } else if (Device.deviceName === 'RELAX') {
      setIsTvThree(true);
    }
  }, []);

  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);

    const getTvProfiles = () => {
      const dbRef = ref(database);
  
      try {
        onValue(dbRef, (snapshot) => {
          if (snapshot.exists()) { // Check if snapshot exists
            const data = snapshot.val();
            const tvProfiles = data?.['tv-profiles'];

            if (data?.['tv-volumes']['tv-one-volume']) {
              setTvVolume(data?.['tv-volumes']['tv-one-volume']);
            } else {
              setTvVolume(0.7);
            }

            if (tvProfiles) {
              for (const profileKey in tvProfiles) {
                if (profileKey === 'tv-one') {
                  const experience = tvProfiles[profileKey]?.experience;
                  if (experience !== undefined) {
                    if (experience === 'energize') {
                      setShowEnergizeVideo(true);
                    } else if (experience === 'none' || experience === 'some_value') {
                      setShowEnergizeVideo(false);
                    }
                  }
                }
                  
                  if (profileKey === 'tv-two') {
                    const experience = tvProfiles[profileKey]?.experience;
                    if (experience !== undefined) {
                      if (experience === 'focus') {
                        setShowFocusVideo(true);
                      } else if (experience === 'none' || experience === 'some_value') {
                        setShowFocusVideo(false);
                      }
                    }
                  }
                  
                  if (profileKey === 'tv-three') {
                    const experience = tvProfiles[profileKey]?.experience;
                    if (experience !== undefined) {
                      if (experience === 'relax') {
                        setShowRelaxVideo(true);
                      } else if (experience === 'none' || experience === 'some_value') {
                        setShowRelaxVideo(false);
                      }
                    }
                  }
                }
              }
            } else {
              console.log("tv-profiles not found in the snapshot.");
            }
        });
      } catch (error) {

      }    
    }
  
    getTvProfiles();
  }, []);

  const handleStatusUpdate = (status) => {
    if (status.uri.indexOf('energize') !== -1 && status.didJustFinish) {
      setShowEnergizeVideo(false);
      console.log('energize playing');
      console.log(status.uri)
    } else if (status.uri.indexOf('focus') !== -1 && status.didJustFinish) {
      setShowFocusVideo(false);
      console.log('focus playing');
      console.log(status.uri)
    } else if (status.uri.indexOf('relax') !== -1 && status.didJustFinish) {
      setShowRelaxVideo(false);
      console.log('relax playing');
      console.log(status.uri)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Image source={ENERGIZE_GRAPHIC} style={isTvOne && !showEnergizeVideo ? styles.imageVisible : styles.imageHidden}/>
      <Image source={FOCUS_GRAPHIC} style={isTvTwo && !showFocusVideo ? styles.imageVisible : styles.imageHidden}/>
      <Image source={RELAX_GRAPHIC} style={isTvThree && !showRelaxVideo ? styles.imageVisible : styles.imageHidden}/>
        {
          showEnergizeVideo && isTvOne && 
          <Video 
            id='energize-video'
            style={isTvOne && styles.videoVisible} 
            source={ENERGIZE}
            useNativeControls={false}
            resizeMode={ResizeMode.CONTAIN} 
            shouldPlay={showEnergizeVideo}
            volume={tvVolume}
            onPlaybackStatusUpdate={(status) => handleStatusUpdate(status)}
            usePoster={true}
            posterSource={ENERGIZE_GRAPHIC}
            posterStyle={{
              height: '100%',
              width: '100%',
              resizeMode: 'contain',
              transform: [{scaleX: 1.03}, {scaleY: 0.91}]
            }}
          />
        }
        {
          showFocusVideo && isTvTwo && 
          <Video 
            style={isTvTwo && styles.videoVisible} 
            source={FOCUS} 
            useNativeControls={false} 
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={showFocusVideo}
            volume={tvVolume}
            onPlaybackStatusUpdate={(status) => handleStatusUpdate(status)}
            usePoster={true}
            posterSource={FOCUS_GRAPHIC}
            posterStyle={{
              height: '100%',
              width: '100%',
              resizeMode: 'contain',
              transform: [{scaleX: 1.03}, {scaleY: 0.91}]
            }}
          />
        }
        {
          showRelaxVideo && isTvThree &&
          <Video 
            style={isTvThree && styles.videoVisible} 
            source={RELAX} 
            useNativeControls={false} 
            resizeMode={ResizeMode.CONTAIN} 
            shouldPlay={showRelaxVideo}
            volume={tvVolume}
            onPlaybackStatusUpdate={(status) => handleStatusUpdate(status)}
            usePoster={true}
            posterSource={RELAX_GRAPHIC}
            posterStyle={{
              height: '100%',
              width: '100%',
              resizeMode: 'contain',
              transform: [{scaleX: 1.03}, {scaleY: 0.91}]
            }}
          />
        }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width,
    height: height,
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoVisible: {
    width: '100%',
    height: '100%',
    transform: [{rotate: '-90deg'}, {scaleX: 1.7}, {scaleY: 0.6}],
  },
  videoHidden: {
    width: '100%',
    height: '0%',
    transform: [{rotate: '-90deg'}],
  },
  imageVisible: {
    resizeMode: 'stretch',
    transform: [{rotate: '-90deg'}, {scaleY: 1.75}, {scaleX: 3.15}],
    height: 300,
    width: '100%',
    aspectRatio: 1,
  },
  imageHidden: {
    resizeMode: 'center',
    transform: [{rotate: '-90deg'}, {scale: 1.7}],
    height: '0%',
  }
});
