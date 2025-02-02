import { MMKV } from 'react-native-mmkv';

export function getMMKV(id: string) {
  const mmkv = new MMKV({ id });

  // Get all keys in MMKV storage
  const keys = mmkv.getAllKeys();

  // Filter keys by the MMKV ID;
  // JSON.parse(mmkv.getString('savedshows'));
  console.log(
    'MMKV Keys:',
    keys,
    mmkv.getString('savedshows') //!== 'undefined'
      ? mmkv.getString('savedshows') //JSON.parse(JSON.stringify(mmkv.getString('savedshows')))
      : 'EMPTY'
  );
}
