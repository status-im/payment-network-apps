import { Dispatch } from 'redux';
import { config } from '../global';

export const BLOCK_LOADED = "BLOCK_LOADED";
export interface BlockLoadedAction {
  type: typeof BLOCK_LOADED
  number: number
  timestamp: number
}

export type BlocksActions =
  BlockLoadedAction;

export const blockLoaded = (number: number, timestamp: number): BlockLoadedAction => ({
  type: BLOCK_LOADED,
  number,
  timestamp,
});

export const loadBlock = (number: number) => {
  return (dispatch: Dispatch) => {
    config.web3!.eth.getBlock(number).then(b => {
      let timestamp;
      if (typeof b.timestamp === "string") {
        timestamp = parseInt(b.timestamp);
      } else {
        timestamp = b.timestamp;
      }

      dispatch(blockLoaded(b.number, timestamp));
    })
  };
}
