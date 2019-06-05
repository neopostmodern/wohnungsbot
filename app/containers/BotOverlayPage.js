// @flow
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import BotOverlay from '../components/BotOverlay';
import { performScroll } from '../actions/electron';

function mapStateToProps(state) {
  return {
    puppet: state.electron.views.puppet,
    overlay: state.overlay,
    verdicts: state.data.verdicts
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ performScroll }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BotOverlay);
