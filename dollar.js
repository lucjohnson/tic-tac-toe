/**
 * The $1 Unistroke Recognizer (JavaScript version)
 *
 *	Jacob O. Wobbrock, Ph.D.
 * 	The Information School
 *	University of Washington
 *	Seattle, WA 98195-2840
 *	wobbrock@uw.edu
 *
 *	Andrew D. Wilson, Ph.D.
 *	Microsoft Research
 *	One Microsoft Way
 *	Redmond, WA 98052
 *	awilson@microsoft.com
 *
 *	Yang Li, Ph.D.
 *	Department of Computer Science and Engineering
 * 	University of Washington
 *	Seattle, WA 98195-2840
 * 	yangli@cs.washington.edu
 *
 * The academic publication for the $1 recognizer, and what should be 
 * used to cite it, is:
 *
 *	Wobbrock, J.O., Wilson, A.D. and Li, Y. (2007). Gestures without 
 *	  libraries, toolkits or training: A $1 recognizer for user interface 
 *	  prototypes. Proceedings of the ACM Symposium on User Interface 
 *	  Software and Technology (UIST '07). Newport, Rhode Island (October 
 *	  7-10, 2007). New York: ACM Press, pp. 159-168.
 *
 * The Protractor enhancement was separately published by Yang Li and programmed 
 * here by Jacob O. Wobbrock:
 *
 *	Li, Y. (2010). Protractor: A fast and accurate gesture
 *	  recognizer. Proceedings of the ACM Conference on Human
 *	  Factors in Computing Systems (CHI '10). Atlanta, Georgia
 *	  (April 10-15, 2010). New York: ACM Press, pp. 2169-2172.
 *
 * This software is distributed under the "New BSD License" agreement:
 *
 * Copyright (C) 2007-2012, Jacob O. Wobbrock, Andrew D. Wilson and Yang Li.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *    * Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in the
 *      documentation and/or other materials provided with the distribution.
 *    * Neither the names of the University of Washington nor Microsoft,
 *      nor the names of its contributors may be used to endorse or promote
 *      products derived from this software without specific prior written
 *      permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Jacob O. Wobbrock OR Andrew D. Wilson
 * OR Yang Li BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
 * OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
**/
//
// Point class
//
function Point(x, y) // constructor
{
	this.X = x;
	this.Y = y;
}
//
// Rectangle class
//
function Rectangle(x, y, width, height) // constructor
{
	this.X = x;
	this.Y = y;
	this.Width = width;
	this.Height = height;
}
//
// Unistroke class: a unistroke template
//
function Unistroke(name, points) // constructor
{
	this.Name = name;
	this.Points = Resample(points, NumPoints);
	var radians = IndicativeAngle(this.Points);
	this.Points = RotateBy(this.Points, -radians);
	this.Points = ScaleTo(this.Points, SquareSize);
	this.Points = TranslateTo(this.Points, Origin);
	this.Vector = Vectorize(this.Points); // for Protractor
}
//
// Result class
//
function Result(name, score) // constructor
{
	this.Name = name;
	this.Score = score;
}
//
// DollarRecognizer class constants
//
var NumUnistrokes = 16;
var NumPoints = 64;
var SquareSize = 250.0;
var Origin = new Point(0,0);
var Diagonal = Math.sqrt(SquareSize * SquareSize + SquareSize * SquareSize);
var HalfDiagonal = 0.5 * Diagonal;
var AngleRange = Deg2Rad(45.0);
var AnglePrecision = Deg2Rad(2.0);
var Phi = 0.5 * (-1.0 + Math.sqrt(5.0)); // Golden Ratio
//
// DollarRecognizer class
//
function DollarRecognizer() // constructor
{
	//
	// one built-in unistroke per gesture type
	//
	this.Unistrokes = new Array();
	this.Unistrokes[0] = new Unistroke("restart", new Array(new Point(-157,0),new Point(-153,14),new Point(-145,26),new Point(-137,37),new Point(-128,48),new Point(-119,59),new Point(-109,68),new Point(-99,77),new Point(-89,86),new Point(-79,96),new Point(-68,103),new Point(-57,110),new Point(-45,112),new Point(-33,113),new Point(-21,111),new Point(-9,107),new Point(3,102),new Point(15,98),new Point(25,91),new Point(32,78),new Point(39,66),new Point(42,52),new Point(45,38),new Point(47,22),new Point(46,7),new Point(44,-8),new Point(41,-22),new Point(41,-37),new Point(38,-52),new Point(34,-66),new Point(30,-81),new Point(27,-96),new Point(22,-107),new Point(20,-107),new Point(28,-96),new Point(37,-85),new Point(45,-73),new Point(53,-62),new Point(62,-51),new Point(71,-41),new Point(81,-32),new Point(92,-24),new Point(93,-17),new Point(81,-13),new Point(69,-8),new Point(57,-4),new Point(45,0),new Point(33,5),new Point(21,9),new Point(9,14),new Point(-3,18),new Point(-15,23),new Point(-20,20),new Point(-16,6),new Point(-12,-8),new Point(-8,-23),new Point(-3,-37),new Point(0,-51),new Point(4,-66),new Point(5,-81),new Point(9,-96),new Point(11,-111),new Point(13,-126),new Point(16,-137)));
	this.Unistrokes[1] = new Unistroke("X", new Array(new Point(-108,7),new Point(-103,-14),new Point(-96,-27),new Point(-88,-40),new Point(-81,-52),new Point(-71,-57),new Point(-61,-55),new Point(-53,-45),new Point(-44,-34),new Point(-36,-24),new Point(-30,-10),new Point(-22,2),new Point(-16,16),new Point(-9,30),new Point(-2,43),new Point(5,55),new Point(13,68),new Point(20,80),new Point(30,88),new Point(40,93),new Point(50,95),new Point(61,94),new Point(68,85),new Point(76,74),new Point(85,64),new Point(90,49),new Point(96,36),new Point(99,19),new Point(102,3),new Point(105,-14),new Point(107,-31),new Point(108,-48),new Point(108,-65),new Point(109,-82),new Point(109,-99),new Point(98,-116),new Point(87,-115),new Point(77,-110),new Point(67,-103),new Point(57,-96),new Point(48,-88),new Point(38,-80),new Point(29,-71),new Point(19,-64),new Point(10,-56),new Point(1,-47),new Point(-8,-38),new Point(-17,-29),new Point(-26,-19),new Point(-35,-9),new Point(-44,1),new Point(-52,11),new Point(-61,21),new Point(-70,31),new Point(-78,41),new Point(-86,53),new Point(-94,65),new Point(-102,77),new Point(-109,90),new Point(-116,102),new Point(-124,114),new Point(-134,123),new Point(-141,133)));
	this.Unistrokes[2] = new Unistroke("O", new Array(new Point(-90,0),new Point(-88,12),new Point(-81,24),new Point(-74,36),new Point(-67,48),new Point(-57,59),new Point(-48,70),new Point(-38,81),new Point(-24,87),new Point(-9,92),new Point(7,96),new Point(23,99),new Point(39,103),new Point(55,102),new Point(71,99),new Point(87,96),new Point(103,91),new Point(116,84),new Point(127,74),new Point(134,62),new Point(137,49),new Point(134,36),new Point(130,23),new Point(125,10),new Point(119,-2),new Point(113,-15),new Point(107,-27),new Point(99,-39),new Point(90,-49),new Point(77,-57),new Point(62,-63),new Point(47,-67),new Point(31,-71),new Point(15,-71),new Point(-1,-68),new Point(-17,-62),new Point(-31,-56),new Point(-45,-49),new Point(-56,-39),new Point(-67,-29),new Point(-80,-20),new Point(-91,-11),new Point(-101,0),new Point(-110,10),new Point(-113,23),new Point(-105,33),new Point(-90,38),new Point(-74,40),new Point(-58,37),new Point(-48,27),new Point(-40,15),new Point(-34,3),new Point(-29,-10),new Point(-25,-23),new Point(-20,-36),new Point(-16,-49),new Point(-12,-61),new Point(-15,-75),new Point(-18,-88),new Point(-23,-100),new Point(-29,-113),new Point(-35,-125),new Point(-39,-138),new Point(-49,-147)));
	this.Unistrokes[3] = new Unistroke("winner", new Array(new Point(-153,0),new Point(-144,8),new Point(-135,17),new Point(-126,25),new Point(-117,34),new Point(-108,42),new Point(-99,50),new Point(-88,57),new Point(-78,64),new Point(-68,71),new Point(-57,77),new Point(-46,83),new Point(-35,89),new Point(-24,94),new Point(-12,98),new Point(0,100),new Point(12,101),new Point(25,99),new Point(34,92),new Point(41,81),new Point(42,69),new Point(38,57),new Point(33,45),new Point(28,34),new Point(21,24),new Point(15,13),new Point(7,3),new Point(-2,-5),new Point(-11,-14),new Point(-20,-23),new Point(-28,-33),new Point(-35,-42),new Point(-44,-51),new Point(-52,-61),new Point(-47,-59),new Point(-40,-50),new Point(-32,-40),new Point(-23,-32),new Point(-14,-23),new Point(-5,-15),new Point(4,-6),new Point(14,2),new Point(25,7),new Point(37,11),new Point(48,16),new Point(60,18),new Point(72,17),new Point(85,16),new Point(95,11),new Point(97,0),new Point(95,-12),new Point(91,-24),new Point(87,-36),new Point(81,-47),new Point(76,-58),new Point(71,-70),new Point(64,-80),new Point(57,-90),new Point(49,-100),new Point(43,-111),new Point(36,-121),new Point(28,-131),new Point(20,-141),new Point(11,-149)));
	
	//
	// The $1 Gesture Recognizer API begins here -- 3 methods: Recognize(), AddGesture(), and DeleteUserGestures()
	//
	this.Recognize = function(points, useProtractor)
	{
		points = Resample(points, NumPoints);
		var radians = IndicativeAngle(points);
		points = RotateBy(points, -radians);
		points = ScaleTo(points, SquareSize);
		points = TranslateTo(points, Origin);
		var vector = Vectorize(points); // for Protractor

		var b = +Infinity;
		var u = -1;
		for (var i = 0; i < this.Unistrokes.length; i++) // for each unistroke
		{
			var d;
			if (useProtractor) // for Protractor
				d = OptimalCosineDistance(this.Unistrokes[i].Vector, vector);
			else // Golden Section Search (original $1)
				d = DistanceAtBestAngle(points, this.Unistrokes[i], -AngleRange, +AngleRange, AnglePrecision);
			if (d < b) {
				b = d; // best (least) distance
				u = i; // unistroke
			}
		}
		return (u == -1) ? new Result("No match.", 0.0) : new Result(this.Unistrokes[u].Name, useProtractor ? 1.0 / b : 1.0 - b / HalfDiagonal);
	};
	this.AddGesture = function(name, points)
	{
		this.Unistrokes[this.Unistrokes.length] = new Unistroke(name, points); // append new unistroke
		var num = 0;
		for (var i = 0; i < this.Unistrokes.length; i++) {
			if (this.Unistrokes[i].Name == name)
				num++;
		}
		return num;
	}
	this.DeleteUserGestures = function()
	{
		this.Unistrokes.length = NumUnistrokes; // clear any beyond the original set
		return NumUnistrokes;
	}
}
//
// Private helper functions from this point down
//
function Resample(points, n)
{
	var I = PathLength(points) / (n - 1); // interval length
	var D = 0.0;
	var newpoints = new Array(points[0]);
	for (var i = 1; i < points.length; i++)
	{
		var d = Distance(points[i - 1], points[i]);
		if ((D + d) >= I)
		{
			var qx = points[i - 1].X + ((I - D) / d) * (points[i].X - points[i - 1].X);
			var qy = points[i - 1].Y + ((I - D) / d) * (points[i].Y - points[i - 1].Y);
			var q = new Point(qx, qy);
			newpoints[newpoints.length] = q; // append new point 'q'
			points.splice(i, 0, q); // insert 'q' at position i in points s.t. 'q' will be the next i
			D = 0.0;
		}
		else D += d;
	}
	if (newpoints.length == n - 1) // somtimes we fall a rounding-error short of adding the last point, so add it if so
		newpoints[newpoints.length] = new Point(points[points.length - 1].X, points[points.length - 1].Y);
	return newpoints;
}
function IndicativeAngle(points)
{
	var c = Centroid(points);
	return Math.atan2(c.Y - points[0].Y, c.X - points[0].X);
}
function RotateBy(points, radians) // rotates points around centroid
{
	var c = Centroid(points);
	var cos = Math.cos(radians);
	var sin = Math.sin(radians);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = (points[i].X - c.X) * cos - (points[i].Y - c.Y) * sin + c.X
		var qy = (points[i].X - c.X) * sin + (points[i].Y - c.Y) * cos + c.Y;
		newpoints[newpoints.length] = new Point(qx, qy);
	}
	return newpoints;
}
function ScaleTo(points, size) // non-uniform scale; assumes 2D gestures (i.e., no lines)
{
	var B = BoundingBox(points);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = points[i].X * (size / B.Width);
		var qy = points[i].Y * (size / B.Height);
		newpoints[newpoints.length] = new Point(qx, qy);
	}
	return newpoints;
}
function TranslateTo(points, pt) // translates points' centroid
{
	var c = Centroid(points);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = points[i].X + pt.X - c.X;
		var qy = points[i].Y + pt.Y - c.Y;
		newpoints[newpoints.length] = new Point(qx, qy);
	}
	return newpoints;
}
function Vectorize(points) // for Protractor
{
	var sum = 0.0;
	var vector = new Array();
	for (var i = 0; i < points.length; i++) {
		vector[vector.length] = points[i].X;
		vector[vector.length] = points[i].Y;
		sum += points[i].X * points[i].X + points[i].Y * points[i].Y;
	}
	var magnitude = Math.sqrt(sum);
	for (var i = 0; i < vector.length; i++)
		vector[i] /= magnitude;
	return vector;
}
function OptimalCosineDistance(v1, v2) // for Protractor
{
	var a = 0.0;
	var b = 0.0;
	for (var i = 0; i < v1.length; i += 2) {
		a += v1[i] * v2[i] + v1[i + 1] * v2[i + 1];
                b += v1[i] * v2[i + 1] - v1[i + 1] * v2[i];
	}
	var angle = Math.atan(b / a);
	return Math.acos(a * Math.cos(angle) + b * Math.sin(angle));
}
function DistanceAtBestAngle(points, T, a, b, threshold)
{
	var x1 = Phi * a + (1.0 - Phi) * b;
	var f1 = DistanceAtAngle(points, T, x1);
	var x2 = (1.0 - Phi) * a + Phi * b;
	var f2 = DistanceAtAngle(points, T, x2);
	while (Math.abs(b - a) > threshold)
	{
		if (f1 < f2) {
			b = x2;
			x2 = x1;
			f2 = f1;
			x1 = Phi * a + (1.0 - Phi) * b;
			f1 = DistanceAtAngle(points, T, x1);
		} else {
			a = x1;
			x1 = x2;
			f1 = f2;
			x2 = (1.0 - Phi) * a + Phi * b;
			f2 = DistanceAtAngle(points, T, x2);
		}
	}
	return Math.min(f1, f2);
}
function DistanceAtAngle(points, T, radians)
{
	var newpoints = RotateBy(points, radians);
	return PathDistance(newpoints, T.Points);
}
function Centroid(points)
{
	var x = 0.0, y = 0.0;
	for (var i = 0; i < points.length; i++) {
		x += points[i].X;
		y += points[i].Y;
	}
	x /= points.length;
	y /= points.length;
	return new Point(x, y);
}
function BoundingBox(points)
{
	var minX = +Infinity, maxX = -Infinity, minY = +Infinity, maxY = -Infinity;
	for (var i = 0; i < points.length; i++) {
		minX = Math.min(minX, points[i].X);
		minY = Math.min(minY, points[i].Y);
		maxX = Math.max(maxX, points[i].X);
		maxY = Math.max(maxY, points[i].Y);
	}
	return new Rectangle(minX, minY, maxX - minX, maxY - minY);
}
function PathDistance(pts1, pts2)
{
	var d = 0.0;
	for (var i = 0; i < pts1.length; i++) // assumes pts1.length == pts2.length
		d += Distance(pts1[i], pts2[i]);
	return d / pts1.length;
}
function PathLength(points)
{
	var d = 0.0;
	for (var i = 1; i < points.length; i++)
		d += Distance(points[i - 1], points[i]);
	return d;
}
function Distance(p1, p2)
{
	var dx = p2.X - p1.X;
	var dy = p2.Y - p1.Y;
	return Math.sqrt(dx * dx + dy * dy);
}
function Deg2Rad(d) { return (d * Math.PI / 180.0); }