import React from 'react';

import ColorPicker from './ColorPicker';
import Decklist from './Decklist';
import SizeSelector from './SizeSelector';

export default class Layout extends React.Component {
	constructor() {
		super();
		this.state = {
			sizes: [60, 40],
			selectedSize: 60,
			colors: ['black', 'white', 'red', 'green', 'blue'],
			selectedColors: [],
			decklist: []
		};
	}

	randomInt (variance) {
		return Math.floor(Math.random() * variance);
	}

	offset (variance) {
		return this.randomInt(variance) * (Math.round(Math.random()) * 2 - 1);
	}

	changeSelectedColors (selectedColors) {
		this.setState({selectedColors});
	}

	changeSelectedSize (selectedSize) {
		this.setState({selectedSize});
	}

	changeDecklist (decklist) {
		this.setState({decklist});
	}

	getColorDistribution (totalCards, selectedColors) {
		var cardsPerColor = Math.floor(totalCards / selectedColors.length),
			cardDistribution = _.map(selectedColors, (color) => {
				var cardCount = cardsPerColor + this.offset(5);
				if (cardCount < totalCards) {
					totalCards -= cardCount;
				} else {
					cardCount = totalCards;
					totalCards = 0;
				}
				return { 'color': color, 'size': cardCount };
			});
		if (totalCards > 0) {
			cardDistribution.push({ 'color': 'artifact', 'size': totalCards });
		}

       	var cardPromises = _.map(cardDistribution, this.getTypeDistribution.bind(this));
        Promise.all(cardPromises).then(function (loadedCards) {
			this.changeDecklist(cardDistribution);
		}.bind(this));
	}

	getTypeDistribution (color) {
		var totalCards = color.size,
			cardType = { 'color': color.color, 'percentage': 1, 'total': 0, 'cards': [] };
		if (color.color === 'artifact') {
			color.cards = {
				'artifact': {
					__proto__: cardType,
					color: '',
					total: color.size
				}
			};
		} else {
			var types = { 'land': 0.4, 'sorcery': 0.3, 'instant': 0.15, 'creature': 0.15 };
			color.cards = _.mapValues(types, function (type) {
				return {
					__proto__: cardType,
					'percentage': type
				};
			});
			while (totalCards > 0) {
				_.each(color.cards, function (card, index) {
					var typeTotal = Math.floor(color.size * card.percentage) + this.offset(3);
					if (typeTotal > totalCards) {
						typeTotal = totalCards;
					} else if (typeTotal < 0) {
						typeTotal = 0;
					}
					card.total += typeTotal,
					totalCards -= typeTotal;
				}.bind(this));
			}
		}

        var cardPromises = _.map(color.cards, this.getCardData.bind(this));
        return Promise.all(cardPromises);
	}

	getCardData (data, index) {
		if (data.total > 0) {
			var url = '';
			if (index !== 'land') {
				const color = data.color ? `&color=${data.color}` : '',
					type = index ? `&type=${index}` : '';
				url = `https://api.deckbrew.com/mtg/cards?format=standard${color}${type}`;
			} else {
				const landMapping = {
						'white': 'plains',
						'black': 'swamp',
						'red': 'mountain',
						'blue': 'island',
						'green': 'forest'
					};
				url = `https://api.deckbrew.com/mtg/cards?type=land&supertype=basic&name=${landMapping[data.color]}`;
			}

			return this.makeRequest(url)
				.then(function (response) {
					var cards = JSON.parse(response);
					var totalCards = data.total;
					while (totalCards > 0) {
						var cardIndex = this.randomInt(cards.length),
							cardData = cards[cardIndex],
							cardDuplicates = index !== 'land' ? this.randomInt(4) + 1 : data.total;
						if (cardDuplicates > totalCards) {
							cardDuplicates = totalCards;
						}
						data.cards.push({
							'card': cardData,
							'duplicates': cardDuplicates
						});
                        totalCards -= cardDuplicates;
                    }
				}.bind(this))
				.catch(function (err) {
					console.error('Error:', err.statusText);
				});
		}
	}

	buildDeck () {
		this.getColorDistribution(this.state.selectedSize, this.state.selectedColors);
	}

	makeRequest (url) {
		return new Promise(function (resolve, reject) {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', url);
			xhr.onload = function () {
				if (this.status >= 200 && this.status < 300) {
					resolve(xhr.response);
				} else {
					reject({
						status: this.status,
						statusText: xhr.statusText
					});
				}
			};
			xhr.onerror = function () {
				reject({
					status: this.status,
					statusText: xhr.statusText
				});
			};
			xhr.send();
		});
    }

	render() {
		return (
			<div>
				<div class='row'>
					<div class='small-12 columns'>
						<div class='deck-properties'>
							<ColorPicker changeSelectedColors={this.changeSelectedColors.bind(this)} colors={this.state.colors}/>
							<SizeSelector changeSelectedSize={this.changeSelectedSize.bind(this)} sizes={this.state.sizes}/>
							<div class='small-12 medium-6 columns'>
								<a class='button build-button' onClick={this.buildDeck.bind(this)}>Build</a>
							</div>
						</div>
					</div>
				</div>
				<div class='row'>
					<div class='small-12 columns'>
						<Decklist decklist={this.state.decklist}/>
					</div>
				</div>
			</div>
		);
	}
}
