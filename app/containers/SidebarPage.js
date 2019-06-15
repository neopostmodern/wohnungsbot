import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Sidebar from '../components/Sidebar';
import { showConfiguration } from '../actions/electron';
import { returnToSearchPage } from '../actions/bot';

function mapStateToProps(state) {
  const applications = Object.values(state.cache.applications).filter(
    ({ reason }) => reason !== 'UNSUITABLE'
  );
  applications.sort((a, b) => a.timestamp < b.timestamp);

  return {
    applications
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    { returnToSearchPage, showConfiguration },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sidebar);
