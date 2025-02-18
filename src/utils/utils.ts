//~  --------------------------------------
//~  format Epoch number to not include any time information
//~  You can send either milliseconds or seconds, but you
//~  will always get back seconds
//~  --------------------------------------
export const formatEpoch = (epoch: number) => {
  if (!epoch) return 0;
  if (epoch < 1e12) {
    epoch = epoch * 1000;
  }
  const newDate = new Date(epoch);
  newDate.setHours(0, 0, 0, 0);
  return Math.floor(newDate.getTime() / 1000);
};
