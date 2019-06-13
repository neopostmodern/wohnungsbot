// @flow
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import BotOverlay from '../components/BotOverlay';
import { performScroll } from '../actions/electron';
import BOUNDING_BOX_GROUPS from '../constants/boundingBoxGroups';

function mapStateToProps(state) {
  return {
    isPuppetLoading: !state.electron.views.puppet.ready,
    animations: state.overlay.animations,
    overviewBoundingBoxes: state.overlay.boundingBoxes.filter(
      ({ group }) => group === BOUNDING_BOX_GROUPS.OVERVIEW
    ),
    privacyMaskBoundingBoxes: state.overlay.boundingBoxes.filter(
      ({ group }) => group === BOUNDING_BOX_GROUPS.PRIVACY_MASK
    ),
    verdicts: state.data.verdicts,
    isBotActing: state.electron.isBotActing,
    botMessage: state.electron.botMessage
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ performScroll }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BotOverlay);
