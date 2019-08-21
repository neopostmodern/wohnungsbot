// @flow
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import BotOverlay from '../components/BotOverlay';
import { performScroll } from '../actions/electron';
import BOUNDING_BOX_GROUPS from '../constants/boundingBoxGroups';
import type { stateType } from '../reducers/types';

function mapStateToProps(state: stateType) {
  return {
    isPuppetLoading: !state.electron.views.puppet.ready,
    animations: state.overlay.animations,
    overviewBoundingBoxes: state.overlay.boundingBoxes.filter(
      ({ group }) => group === BOUNDING_BOX_GROUPS.OVERVIEW
    ),
    verdicts: state.data.verdicts,
    isBotActing: state.bot.isActive,
    botMessage: state.bot.message,
    showOverlay: state.bot.showOverlay,
    alreadyAppliedFlatIds: Object.keys(state.cache.applications)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ performScroll }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BotOverlay);
