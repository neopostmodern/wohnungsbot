import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Sidebar from '../components/Sidebar';
import { openPDF, showConfiguration } from '../actions/electron';
import { resetBot } from '../actions/bot';

function mapStateToProps(state) {
  const applications = Object.values(state.cache.applications).filter(
    ({ reason }) => reason !== 'UNSUITABLE'
  );

  // most recent applications to the top
  applications.sort((a, b) => Math.sign(b.timestamp - a.timestamp));

  return {
    applications
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ resetBot, showConfiguration, openPDF }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sidebar);
