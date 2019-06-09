// @flow
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import BotOverlay from '../components/BotOverlay';
import { performScroll } from '../actions/electron';

function mapStateToProps(state) {
  return {
    isPuppetLoading: !state.electron.views.puppet.ready,
    overlay: state.overlay,
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
