import { Dispatch } from 'redux';
import { config } from '../global';
import { RootState } from '../reducers';

export const BLOCK_LOADING = "BLOCK_LOADING";
export interface BlockLoadingAction {
  type: typeof BLOCK_LOADING
  number: number
}

export const BLOCK_LOADED = "BLOCK_LOADED";
export interface BlockLoadedAction {
  type: typeof BLOCK_LOADED
  number: number
  timestamp: number
}

export type BlocksActions =
  BlockLoadingAction |
  BlockLoadedAction;

export const blockLoaded = (number: number, timestamp: number): BlockLoadedAction => ({
  type: BLOCK_LOADED,
  number,
  timestamp,
});

export const loadingBlock = (number: number): BlockLoadingAction => ({
  type: BLOCK_LOADING,
  number,
});

export const loadBlock = (number: number) => {
  return (dispatch: Dispatch, getState: () => RootState) => {
    if (getState().blocks[number] !== undefined) {
      // block already loaded
      return;
    }

    dispatch(loadingBlock(number))

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
