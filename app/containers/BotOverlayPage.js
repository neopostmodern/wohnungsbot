// @flow
import { connect } from 'react-redux';
import BotOverlay from '../components/BotOverlay';

function mapStateToProps(state) {
  return {
    puppet: state.electron.views.puppet,
    animations: state.animations
  };
}

export default connect(mapStateToProps)(BotOverlay);
