import React from 'react';


export default class ColorPicker extends React.Component {
	constructor(props) {
   		super(props);
   		this.state = {
   			selectedColors: []
   		}
	}

	handleChange(event) {
		const target = event.target,
			checked = target.checked,
			value = target.value;
		if (checked) {
			this.state.selectedColors.push(value);
		} else {
			_.remove(this.state.selectedColors, (color) => (color === value))
		}

		this.props.changeSelectedColors(this.state.selectedColors);
	}

	render() {
        return (
        	<div class='row'>
        		<div class='small-12 columns'>
					<div class='color-checkboxes'>
						{this.props.colors.map((color) => (
							<div key={color}>
								<input type='checkbox' name="deck-colors" id={color} value={color} onChange={this.handleChange.bind(this)}></input>
								<label for={color}>{color}</label>
							</div>
						))}
					</div>
				</div>
			</div>
        );
 	}
 }
