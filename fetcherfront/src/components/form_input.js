import React, { Component } from 'react';
import AetButton from './aet_button'
import ChosenSelect from './chosen_select'

class FormInput extends Component {
  
  constructor(props){
    super(props)
    this.state = {
      aets : []
    }
    this.handleChange = this.handleChange.bind(this);
  }
  
  handleChange(event) {
    const target = event.target;
    const name = target.name;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    this.setState({[name]: value});
  }
  async componentWillMount() {
    await this.getAets ()
  }

  async getAets () {
    let response= await fetch('/aets')
    let aets=[]
    console.log(response)
    if(response.ok){
      aets = await response.json()
    }
    console.log(aets)
    this.setState( {
      aets : aets
    } )
  }

  modalitiesChoice(state){
    console.log('modalities updated')
    console.log(state)
    this.setState({
      modalities:state
    })
  }

  render(){
    
    let aetButtons=null
    if( this.state.aets.length){
      aetButtons=this.buildAetButtons()
    }
    return (
      <div class="jumbotron" style={this.props.style}>
          <h2 class="card-title">Manual Input</h2>
          <div class="row">
            <div class="col-sm">
              <label for="lastName">Last Name</label>
              <input type="text" name="lastName" id="lastName" class="form-control" placeholder="last name" value={this.state.value} onChange={this.handleChange} />
            </div>
            <div class="col-sm">
              <label for="firstName">First Name</label>
              <input type="text" name="firstName" id="firstName" class="form-control" placeholder="first name" value={this.state.value} onChange={this.handleChange}/>
            </div>
            <div class="col-sm">
              <label for="patientID">Patient ID</label>
              <input type="text" name="patientID" id="patientID" class="form-control" placeholder="Patient ID" value={this.state.value} onChange={this.handleChange}/>
            </div>
        </div>
        <div class="row">
            <div class="col-sm">
                <label for="accessionNumber">Accession Number</label>
                <input type="text" name="accessionNumber" id="accessionNumber" class="form-control" placeholder="Accession Number" value={this.state.value} onChange={this.handleChange}/>
            </div>
            <div class="col-sm">
                <label for="studyDescription">Study Description</label>
                <input type="text" name="studyDescription" id="studyDescription" class="form-control" placeholder="Study Description" value={this.state.value} onChange={this.handleChange}/>
            </div>
            <div class="col-sm">
              <label for="modality">Modality</label>
              <ChosenSelect modalities={()=>this.modalitiesChoice.bind(this)} />
            </div>

        </div>
        <div class="row">
          <div class="col-sm">
              <label for="dateFrom">Date From</label>
              <input type="date" name="dateFrom" id="dateFrom" class="form-control" placeholder="Date From" value={this.state.value} onChange={this.handleChange}/>
            </div>
            <div class="col-sm">
              <label for="dateTo">Date To</label>
              <input type="date" name="dateTo" id="dateTo" class="form-control" placeholder="Date To" value={this.state.value} onChange={this.handleChange}/>
            </div>
        </div>
        
        <div class="row text-center mt-5">
          { aetButtons }
        </div>
      </div>
    )
  };

  addQueryToList(aet){
    console.log(this.state)
    console.log(aet)

  }

  buildAetButtons(){
    console.log('create buttons')
    console.log(this.state.aets)
    return( this.state.aets.map((item, key) =>
      <AetButton key={key} aetName={item} clickListner={()=>this.addQueryToList(item)} />
    ))
  }
}

export default FormInput;
