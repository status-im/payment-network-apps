import {
  BLOCK_LOADING,
  BLOCK_LOADED,
  BlocksActions,
} from '../actions/blocks';

export interface BlockState {
  number: number
  timestamp: number | undefined
}

export interface BlocksState {
  [blockNumber: number]: BlockState
};

const initialState = {};

export const blocksReducer = (state: BlocksState = initialState, action: BlocksActions): BlocksState => {
  switch (action.type) {
    case BLOCK_LOADING: {
      return {
        ...state,
        [action.number]: {
          number: action.number,
          timestamp: undefined,
        }
      }
    }

    case BLOCK_LOADED: {
      const blockState = state[action.number];
      if (blockState === undefined) {
        return state;
      }

      return {
        ...state,
        [action.number]: {
          ...blockState,
          timestamp: action.timestamp,
        }
      }
    }
  }

  return state;
}
