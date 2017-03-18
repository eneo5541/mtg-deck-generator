import React from 'react';


export default class SizeSelector extends React.Component {
	handleChange(event) {
		const value = event.target.value;
		this.props.changeSelectedSize(event.target.value);
	}

	render() {
        return (
			<div class='small-12 medium-6 columns'>
				<div class='size-dropdown'>
					<select onChange={this.handleChange.bind(this)}>
						{this.props.sizes.map((size) => (
							<option key={size} value={size}>{size} cards</option>
						))}
					</select>
				</div>
			</div>
        );
 	}
 }
