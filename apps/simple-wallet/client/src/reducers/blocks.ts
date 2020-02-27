import {
  BLOCK_LOADED,
  BlocksActions,
} from '../actions/blocks';

export interface BlockState {
  number: number
  timestamp: number
}

export interface BlocksState {
  [blockNumber: number]: BlockState
};

const initialState = {};

export const blocksReducer = (state: BlocksState = initialState, action: BlocksActions): BlocksState => {
  switch (action.type) {
    case BLOCK_LOADED: {
      return {
        ...state,
        [action.number]: {
          number: action.number,
          timestamp: action.timestamp,
        }
      }
    }
  }

  return state;
}
