import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Sidebar from '../components/Sidebar';
import { clickLogin, electronRouting } from '../actions/electron';

function mapStateToProps(state) {
  return {
    puppet: state.electron.views.puppet,
    data: state.data
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ clickLogin, electronRouting }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sidebar);
