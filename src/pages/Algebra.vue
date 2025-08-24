<template>
  <v-container fill-height fluid>
    <br/>
    <v-row class="align-center justify-center">
      <span class="text-h4 text-center" style="font-weight: bold">ALGEBRA</span>
    </v-row>
    <br/>
    <v-row>
      <v-col>
        <fieldset class="mathfieldset">
          <legend class="mathlegend">ARITHMETIC PROPERTIES</legend>
          <div class="mathtable">
            <div class="mathrow">
              <div class="mathcolumn" style="padding-right: 30px;"><math><mtext>ASSOCIATIVE</mtext></math></div>
              <div class="mathcolumn"><math><mi>a</mi><mo>(</mo><mi>b</mi><mi>c</mi><mo>)</mo> <mo>=</mo><mo>(</mo><mi>a</mi><mi>b</mi><mo>)</mo><mi>c</mi></math></div>
            </div>
            <div class="mathrow">
              <div class="mathcolumn" style="padding-right: 30px;"><math><mtext>COMMUTATIVE</mtext></math></div>
              <div class="mathcolumn"><math><mi>a</mi> <mo>+</mo> <mi>b</mi> <mo>=</mo> <mi>b</mi> <mo>+</mo> <mi>a</mi> <mtext>&nbsp; and &nbsp;</mtext> <mi>a</mi><mi>b</mi> <mo>=</mo> <mi>b</mi><mi>a</mi></math></div>
            </div>
            <div class="mathrow">
              <div class="mathcolumn" style="padding-right: 30px;"><math><mtext>DISTRIBUTIVE</mtext></math></div>
              <div class="mathcolumn"><math><mi>a</mi><mo>(</mo><mi>b</mi><mo>+</mo><mi>c</mi><mo>)</mo> <mo>=</mo> <mi>a</mi><mi>b</mi> <mo>+</mo> <mi>a</mi><mi>c</mi></math></div>
            </div>
          </div>
        </fieldset>
        &nbsp;
        <fieldset class="mathfieldset">
          <legend class="mathlegend">EXPOENENT PROPERTIES</legend>
          <div class="mathtable">
            <div class="mathrow">
              <div class="mathcolumn">
                <math>
                  <msup><mi>a</mi><mi>n</mi></msup>
                  <msup><mi>a</mi><mi>m</mi></msup>
                  <mo>=</mo>
                  <msup><mi>a</mi><mrow><mi>n</mi><mo>+</mo><mi>m</mi></mrow></msup>
                </math>
              </div>
            </div>
            <div class="mathrow">
              <div class="mathcolumn">
                <math>
                  <msup><mrow><mo>(</mo><msup><mi>a</mi><mi>n</mi></msup><mo>)</mo></mrow><mi>m</mi></msup>
                  <mo>=</mo>
                  <msup><mi>a</mi><mi>nm</mi></msup>
                </math>
              </div>
            </div>
            <div class="mathrow">
              <div class="mathcolumn">
                <math>
                  <msup><mrow><mo>(</mo><mi>a</mi><mi>b</mi><mo>)</mo></mrow><mi>n</mi></msup>
                  <mo>=</mo>
                  <msup><mi>a</mi><mi>n</mi></msup><msup><mi>b</mi><mi>n</mi></msup>
                </math>
              </div>
            </div>
            <div class="mathrow">
              <div class="mathcolumn">
                <math>
                  <msup><mi>a</mi><mrow><mo>-</mo><mi>n</mi></mrow></msup>
                  <mo>=</mo>
                  <mfrac><mi>1</mi><msup><mi>a</mi><mi>n</mi></msup></mfrac>
                </math>
              </div>
            </div>
            <div class="mathrow">
              <div class="mathcolumn">
                <math>
                  <msup><mrow><mo>(</mo><mfrac><mi>a</mi><mi>b</mi></mfrac><mo>)</mo></mrow><mrow><mo>-</mo><mi>n</mi></mrow></msup>
                  <mo>=</mo>
                  <msup><mrow><mo>(</mo><mfrac><mi>b</mi><mi>a</mi></mfrac><mo>)</mo></mrow><mi>n</mi></msup>
                  <mo>=</mo>
                  <mfrac><mrow><msup><mi>b</mi><mi>n</mi></msup></mrow><mrow><msup><mi>a</mi><mi>n</mi></msup></mrow></mfrac>
                </math>
              </div>
            </div>
            <div class="mathrow">
              <div class="mathcolumn">
                <math>
                  <mfrac><mrow><msup><mi>a</mi><mi>n</mi></msup></mrow><mrow><msup><mi>a</mi><mi>m</mi></msup></mrow></mfrac>
                  <mo>=</mo>
                  <msup><mi>a</mi><mrow><mi>n</mi><mo>-</mo><mi>m</mi></mrow></msup>
                  <mo>=</mo>
                  <mfrac><mn>1</mn><mrow><msup><mi>a</mi><mrow><mi>m</mi><mo>-</mo><mi>n</mi></mrow></msup></mrow></mfrac>
                </math>
              </div>
            </div>
            <div class="mathrow">
              <div class="mathcolumn">
                <math>
                  <msup><mi>a</mi><mn>0</mn></msup><mo>=</mo><mn>1</mn>
                  <mtext>&nbsp;,&nbsp;</mtext>
                  <mi>a</mi><mo>&ne;</mo><mn>0</mn>
                </math>
              </div>
            </div>
            <div class="mathrow">
              <div class="mathcolumn">
                <math>
                  <msup><mrow><mo>(</mo><mfrac><mi>a</mi><mi>b</mi></mfrac><mo>)</mo></mrow><mi>n</mi></msup>
                  <mo>=</mo>
                  <mfrac><mrow><msup><mi>a</mi><mi>n</mi></msup></mrow><mrow><msup><mi>b</mi><mi>n</mi></msup></mrow></mfrac>
                </math>
              </div>
            </div>
            <div class="mathrow">
              <div class="mathcolumn">
                <math>
                  <mfrac><mi>1</mi><msup><mi>a</mi><mrow><mo>-</mo><mi>n</mi></mrow></msup></mfrac>
                  <mo>=</mo>
                  <msup><mi>a</mi><mi>n</mi></msup>
                </math>
              </div>
            </div>
            <div class="mathrow">
              <div class="mathcolumn">
                <math>
                  <msup><mi>a</mi><mrow><mfrac><mi>n</mi><mi>m</mi></mfrac></mrow></msup>
                  <mo>=</mo>
                  <msup><mrow><mo>(</mo><msup><mi>a</mi><mrow><mfrac><mn>1</mn><mi>m</mi></mfrac></mrow></msup><mo>)</mo></mrow><mi>n</mi></msup>
                  <mo>=</mo>
                  <msup><mrow><mo>(</mo><msup><mi>a</mi><mi>n</mi></msup><mo>)</mo></mrow><mrow><mfrac><mn>1</mn><mi>m</mi></mfrac></mrow></msup>
                </math>
              </div>
            </div>
          </div>
        </fieldset>
        &nbsp;
        <fieldset class="mathfieldset">
          <legend class="mathlegend">PROPERTIES OF INEQUALITIES</legend>
          <div class="mathtable">
            <div class="mathrow">
              <div class="mathcolumn">
                <math>
                  <mrow>
                    <mtext>if &nbsp; </mtext>
                    <mi>a</mi><mo>&lt;</mo><mi>b</mi>
                    <mtext> &nbsp; then &nbsp; </mtext>
                    <mi>a</mi><mo>+</mo><mi>c</mi><mo>&lt;</mo><mi>b</mi><mo>+</mo><mi>c</mi>
                    <mtext> &nbsp; and &nbsp; </mtext>
                    <mi>a</mi><mo>&#x2212;</mo><mi>c</mi><mo>&lt;</mo><mi>b</mi><mo>&#x2212;</mo><mi>c</mi>
                  </mrow>
                </math>
              </div>
            </div>
            <div class="mathrow">
              <div class="mathcolumn">
                <math>
                  <mrow>
                    <mtext>if &nbsp;</mtext>
                    <mi>a</mi><mo>&lt;</mo><mi>b</mi>
                    <mtext>&nbsp; and &nbsp;</mtext>
                    <mi>c</mi><mo>&gt;</mo><mn>0</mn>
                    <mtext>&nbsp; then &nbsp;</mtext>
                    <mi>a</mi><mi>c</mi><mo>&lt;</mo><mi>b</mi><mi>c</mi>
                    <mtext>&nbsp; and &nbsp;</mtext>
                    <mfrac>
                      <mi>a</mi>
                      <mi>c</mi>
                    </mfrac>
                    <mo>&lt;</mo>
                    <mfrac>
                      <mi>b</mi>
                      <mi>c</mi>
                    </mfrac>
                  </mrow>
                </math>
              </div>
            </div>
            <div class="mathrow">
              <div class="mathcolumn">
                <math>
                  <mrow>
                    <mtext>if &nbsp;</mtext>
                    <mi>a</mi><mo>&lt;</mo><mi>b</mi>
                    <mtext>&nbsp; and &nbsp;</mtext>
                    <mi>c</mi><mo>&lt;</mo><mn>0</mn>
                    <mtext>&nbsp; then &nbsp;</mtext>
                    <mi>a</mi><mi>c</mi><mo>&gt;</mo><mi>b</mi><mi>c</mi>
                    <mtext>&nbsp; and &nbsp;</mtext>
                    <mfrac>
                      <mi>a</mi>
                      <mi>c</mi>
                    </mfrac>
                    <mo>&gt;</mo>
                    <mfrac>
                      <mi>b</mi>
                      <mi>c</mi>
                    </mfrac>
                  </mrow>
                </math>
              </div>
            </div>
          </div>
        </fieldset>
        &nbsp;
        <fieldset class="mathfieldset">
          <legend class="mathlegend">PROPERTIES OF COMPLEX NUMBERS</legend>
          <div class="mathtable">
            <div class="mathrow">
              <div class="mathcolumn">
                <math>
                  <mrow>
                    <mi>i</mi>
                    <mo>=</mo>
                    <msqrt>
                      <mrow>
                        <mo>-</mo><mn>1</mn>
                      </mrow>
                    </msqrt>
                  </mrow>
                </math>
              </div>
            </div>
            <div class="mathrow">
              <div class="mathcolumn">
                <math>
                  <mrow>
                    <msup>
                      <mi>i</mi>
                      <mn>2</mn>
                    </msup>
                    <mo>=</mo>
                    <mo>-</mo>
                    <mn>1</mn>
                  </mrow>
                </math>
              </div>
            </div>
            <div class="mathrow">
              <div class="mathcolumn">
                <math>
                  <mrow>
                    <msqrt>
                      <mrow>
                        <mo>-</mo><mi>a</mi>
                      </mrow>
                    </msqrt>
                    <mo>=</mo>
                    <mi>i</mi>
                    <msqrt>
                      <mi>a</mi>
                    </msqrt>
                    <mo>, &nbsp;</mo>
                    <mi>a</mi>
                    <mo>&#x2265;</mo> <!-- ≥ -->
                    <mn>0</mn>
                  </mrow>
                </math>
              </div>
            </div>
            <div class="mathrow">
              <div class="mathcolumn">
                <math>
                  <mrow>
                    <mo>(</mo>
                    <mi>a</mi><mo>+</mo><mi>b</mi><mi>i</mi>
                    <mo>)</mo>
                    <mo>+</mo>
                    <mo>(</mo>
                    <mi>c</mi><mo>+</mo><mi>d</mi><mi>i</mi>
                    <mo>)</mo>
                    <mo>=</mo>
                    <mi>a</mi><mo>+</mo><mi>c</mi>
                    <mo>+</mo>
                    <mo>(</mo>
                    <mi>b</mi><mo>+</mo><mi>d</mi>
                    <mo>)</mo><mi>i</mi>
                  </mrow>
                </math>
              </div>
            </div>
            <div class="mathrow">
              <div class="mathcolumn">
                <math>
                  <mrow>
                    <mo>(</mo>
                    <mi>a</mi><mo>+</mo><mi>b</mi><mi>i</mi>
                    <mo>)</mo>
                    <mo>&#x2212;</mo> <!-- minus sign -->
                    <mo>(</mo>
                    <mi>c</mi><mo>+</mo><mi>d</mi><mi>i</mi>
                    <mo>)</mo>
                    <mo>=</mo>
                    <mi>a</mi><mo>&#x2212;</mo><mi>c</mi>
                    <mo>+</mo>
                    <mo>(</mo>
                    <mi>b</mi><mo>&#x2212;</mo><mi>d</mi>
                    <mo>)</mo><mi>i</mi>
                  </mrow>
                </math>
              </div>
            </div>
            <div class="mathrow">
              <div class="mathcolumn">
                <math>
                  <mrow>
                    <mo>(</mo>
                    <mi>a</mi><mo>+</mo><mi>b</mi><mi>i</mi>
                    <mo>)</mo>
                    <mo>(</mo>
                    <mi>c</mi><mo>+</mo><mi>d</mi><mi>i</mi>
                    <mo>)</mo>
                    <mo>=</mo>
                    <mi>a</mi><mi>c</mi>
                    <mo>&#x2212;</mo>
                    <mi>b</mi><mi>d</mi>
                    <mo>+</mo>
                    <mo>(</mo>
                    <mi>a</mi><mi>d</mi><mo>+</mo><mi>b</mi><mi>c</mi>
                    <mo>)</mo><mi>i</mi>
                  </mrow>
                </math>
              </div>
            </div>
            <div class="mathrow">
              <div class="mathcolumn">
                <math>
                  <mrow>
                    <mo>(</mo>
                    <mi>a</mi>
                    <mo>+</mo>
                    <mi>b</mi><mi>i</mi>
                    <mo>)</mo>
                    <mo>(</mo>
                    <mi>a</mi>
                    <mo>-</mo>
                    <mi>b</mi><mi>i</mi>
                    <mo>)</mo>
                    <mo>=</mo>
                    <msup><mi>a</mi><mn>2</mn></msup>
                    <mo>+</mo>
                    <msup><mi>b</mi><mn>2</mn></msup>
                  </mrow>
                </math>
              </div>
            </div>
            <div class="mathrow">
              <div class="mathcolumn">
                <math>
                  <mrow>
                    <mo>|</mo>
                    <mi>a</mi>
                    <mo>+</mo>
                    <mi>b</mi><mi>i</mi>
                    <mo>|</mo>
                    <mo>=</mo>
                  </mrow>
                  <msqrt>
                    <mrow>
                      <msup><mi>a</mi><mn>2</mn></msup>
                      <mo>+</mo>
                      <msup><mi>b</mi><mn>2</mn></msup>
                    </mrow>
                  </msqrt>
                </math>
              </div>
            </div>
            <div class="mathrow">
              <div class="mathcolumn">
                <math>
                  <mover>
                    <mrow>
                      <mo>(</mo>
                      <mi>a</mi>
                      <mo>+</mo>
                      <mi>b</mi><mi>i</mi>
                      <mo>)</mo>
                    </mrow>
                    <mo>‾</mo>
                  </mover>
                  <mo>=</mo>
                  <mi>a</mi>
                  <mo>-</mo>
                  <mi>b</mi><mi>i</mi>
                </math>
              </div>
            </div>
            <div class="mathrow">
              <div class="mathcolumn">
                <math>
                  <mrow>
                    <mover>
                      <mrow>
                        <mo>(</mo>
                        <mi>a</mi>
                        <mo>+</mo>
                        <mi>b</mi><mi>i</mi>
                        <mo>)</mo>
                      </mrow>
                      <mo>‾</mo>
                    </mover>
                    <mrow>
                      <mo>(</mo>
                      <mi>a</mi>
                      <mo>+</mo>
                      <mi>b</mi><mi>i</mi>
                      <mo>)</mo>
                    </mrow>
                    <mo>=</mo>
                    <msup>
                      <mrow>
                        <mo>|</mo>
                        <mi>a</mi>
                        <mo>+</mo>
                        <mi>b</mi><mi>i</mi>
                        <mo>|</mo>
                      </mrow>
                      <mn>2</mn>
                    </msup>
                  </mrow>
                </math>
              </div>
            </div>
            <div class="mathrow">
              <div class="mathcolumn">
                <math>
                  <mrow>
                    <mfrac>
                      <mn>1</mn>
                      <mrow>
                        <mo>(</mo>
                        <mi>a</mi>
                        <mo>+</mo>
                        <mi>b</mi><mi>i</mi>
                        <mo>)</mo>
                      </mrow>
                    </mfrac>
                    <mo>=</mo>
                    <mfrac>
                      <mrow>
                        <mo>(</mo>
                        <mi>a</mi>
                        <mo>-</mo>
                        <mi>b</mi><mi>i</mi>
                        <mo>)</mo>
                      </mrow>
                      <mrow>
                        <mo>(</mo>
                        <mi>a</mi>
                        <mo>+</mo>
                        <mi>b</mi><mi>i</mi>
                        <mo>)</mo>
                        <mo>(</mo>
                        <mi>a</mi>
                        <mo>-</mo>
                        <mi>b</mi><mi>i</mi>
                        <mo>)</mo>
                      </mrow>
                    </mfrac>
                    <mo>=</mo>
                    <mfrac>
                      <mrow>
                        <mi>a</mi>
                        <mo>-</mo>
                        <mi>b</mi><mi>i</mi>
                      </mrow>
                      <mrow>
                        <msup><mi>a</mi><mn>2</mn></msup>
                        <mo>+</mo>
                        <msup><mi>b</mi><mn>2</mn></msup>
                      </mrow>
                    </mfrac>
                  </mrow>
                </math>
              </div>
            </div>
          </div>
        </fieldset>
        &nbsp;
        <fieldset class="mathfieldset">
          <legend class="mathlegend">QUADRATIC EQUATION</legend>
            <div class="mathrow">
              <div class="mathcolumn">
                <math>
                  <mtable>
                    <mtr>
                      <mtd>
                        <mtext>For the equation</mtext>
                      </mtd>
                    </mtr>
                    <mtr>
                      <mtd>
                        <mi>a</mi><msup><mi>x</mi><mn>2</mn></msup>
                        <mo>+</mo>
                        <mi>b</mi><mi>x</mi>
                        <mo>+</mo>
                        <mi>c</mi>
                        <mo>=</mo>
                        <mn>0</mn>
                      </mtd>
                    </mtr>
                  </mtable>
                  <mspace width="40px"></mspace>
                  <mrow>
                    <mi>x</mi>
                    <mo>=</mo>
                    <mfrac>
                      <mrow>
                        <mo>-</mo><mi>b</mi>
                        <mo>±</mo>
                        <msqrt>
                          <mrow>
                            <msup><mi>b</mi><mn>2</mn></msup>
                            <mo>-</mo>
                            <mn>4</mn><mi>a</mi><mi>c</mi>
                          </mrow>
                        </msqrt>
                      </mrow>
                      <mrow>
                        <mn>2</mn><mi>a</mi>
                      </mrow>
                    </mfrac>
                  </mrow>
                </math>
              </div>
            </div>
        </fieldset>
        &nbsp;
        <fieldset class="mathfieldset">
          <legend class="mathlegend">RADICAL PROPERTIES</legend>
            <div class="mathrow">
              <div class="mathcolumn">
                <math>
                  <mrow>
                    <mi>a</mi>
                    <mo>,</mo>
                    <mi>b</mi>
                    <mo>≥</mo>
                    <mn>0</mn>
                    <mtext> &nbsp; for even &nbsp; </mtext>
                    <mi>n</mi>
                  </mrow>
                </math>
              </div>
            </div>
            <div class="mathrow">
              <div class="mathcolumn">
                <math>
                  <mrow>
                    <mroot>
                      <mi>a</mi>
                      <mi>n</mi>
                    </mroot>
                    <mo>=</mo>
                    <msup>
                      <mi>a</mi>
                      <mfrac>
                        <mn>1</mn>
                        <mi>n</mi>
                      </mfrac>
                    </msup>
                  </mrow>
                </math>
              </div>
            </div>
            <div class="mathrow">
              <div class="mathcolumn">
                <math>
                  <mrow>
                    <mroot>
                      <mrow>
                        <mroot>
                          <mi>a</mi>
                          <mi>n</mi>
                        </mroot>
                      </mrow>
                      <mi>m</mi>
                    </mroot>
                    <mo>=</mo>
                    <mroot>
                      <mi>a</mi>
                      <mrow>
                        <mi>m</mi><mi>n</mi>
                      </mrow>
                    </mroot>
                  </mrow>
                </math>
              </div>
            </div>
            <div class="mathrow">
              <div class="mathcolumn">
                <math>
                  <mrow>
                    <mroot>
                      <mrow>
                        <mi>a</mi><mi>b</mi>
                      </mrow>
                      <mi>n</mi>
                    </mroot>
                    <mo>=</mo>
                    <mroot>
                      <mi>a</mi>
                      <mi>n</mi>
                    </mroot>
                    <mroot>
                      <mi>b</mi>
                      <mi>n</mi>
                    </mroot>
                  </mrow>
                </math>
              </div>
            </div>
            <div class="mathrow">
              <div class="mathcolumn">
                <math>
                  <mrow>
                    <mroot>
                      <mfrac>
                        <mi>a</mi>
                        <mi>b</mi>
                      </mfrac>
                      <mi>n</mi>
                    </mroot>
                    <mo>=</mo>
                    <mfrac>
                      <mroot>
                        <mi>a</mi>
                        <mi>n</mi>
                      </mroot>
                      <mroot>
                        <mi>b</mi>
                        <mi>n</mi>
                      </mroot>
                    </mfrac>
                  </mrow>
                </math>
              </div>
            </div>
            <div class="mathrow">
              <div class="mathcolumn">
                <math>
                  <mrow>
                    <mroot>
                      <msup>
                        <mi>a</mi>
                        <mi>n</mi>
                      </msup>
                      <mi>n</mi>
                    </mroot>
                    <mo>=</mo>
                    <mi>a</mi>
                    <mo>,</mo>
                    <mtext> if &nbsp; </mtext>
                    <mi>n</mi>
                    <mtext> &nbsp; is odd &nbsp;</mtext>
                  </mrow>
                </math>
              </div>
            </div>
            <div class="mathrow">
              <div class="mathcolumn">
                <math>
                  <mrow>
                    <mroot>
                      <msup>
                        <mi>a</mi>
                        <mi>n</mi>
                      </msup>
                      <mi>n</mi>
                    </mroot>
                    <mo>=</mo>
                    <mrow>
                      <mo>|</mo>
                      <mi>a</mi>
                      <mo>|</mo>
                    </mrow>
                    <mo>,</mo>
                    <mtext> if &nbsp; </mtext>
                    <mi>n</mi>
                    <mtext> &nbsp; is even &nbsp; </mtext>
                  </mrow>
                </math>
              </div>
            </div>
        </fieldset>
        &nbsp;
        <fieldset class="mathfieldset">
          <legend class="mathlegend">LOGARITHM PROPERTIES</legend>
          <div class="mathrow">
            <div class="mathcolumn">
              <math>
                <mrow>
                  <mtext>if &nbsp; </mtext>
                  <mi>y</mi>
                  <mo>=</mo>
                  <msub>
                    <mo>log</mo>
                    <mi>b</mi>
                  </msub>
                  <mi>x</mi>
                  <mtext> &nbsp; then &nbsp; </mtext>
                  <msup>
                    <mi>b</mi>
                    <mi>y</mi>
                  </msup>
                  <mo>=</mo>
                  <mi>x</mi>
                </mrow>
              </math>
            </div>
          </div>
          <div class="mathrow">
            <div class="mathcolumn">
              <math>
                <mrow>
                  <msub>
                    <mo>log</mo>
                    <mi>b</mi>
                  </msub>
                  <mi>b</mi>
                  <mo>=</mo>
                  <mn>1</mn>
                  <mtext> &nbsp; and &nbsp; </mtext>
                  <msub>
                    <mo>log</mo>
                    <mi>b</mi>
                  </msub>
                  <mn>1</mn>
                  <mo>=</mo>
                  <mn>0</mn>
                </mrow>
              </math>
            </div>
          </div>
          <div class="mathrow">
            <div class="mathcolumn">
              <math>
                <mrow>
                  <msub>
                    <mo>log</mo>
                    <mi>b</mi>
                  </msub>
                  <msup>
                    <mi>b</mi>
                    <mi>x</mi>
                  </msup>
                  <mo>=</mo>
                  <mi>x</mi>
                </mrow>
              </math>
            </div>
          </div>
          <div class="mathrow">
            <div class="mathcolumn">
              <math>
                <mrow>
                  <msup>
                    <mi>b</mi>
                    <mrow>
                      <msub>
                        <mo>log</mo>
                        <mi>b</mi>
                      </msub>
                      <mi>x</mi>
                    </mrow>
                  </msup>
                  <mo>=</mo>
                  <mi>x</mi>
                </mrow>
              </math>
            </div>
          </div>
          <div class="mathrow">
            <div class="mathcolumn">
              <math>
                <mrow>
                  <msub>
                    <mo>log</mo>
                    <mi>a</mi>
                  </msub>
                  <mi>x</mi>
                  <mo>=</mo>
                  <mfrac>
                    <mrow>
                      <msub>
                        <mo>log</mo>
                        <mi>b</mi>
                      </msub>
                      <mi>x</mi>
                    </mrow>
                    <mrow>
                      <msub>
                        <mo>log</mo>
                        <mi>b</mi>
                      </msub>
                      <mi>a</mi>
                    </mrow>
                  </mfrac>
                </mrow>
              </math>
            </div>
          </div>
          <div class="mathrow">
            <div class="mathcolumn">
              <math>
                <mrow>
                  <msub>
                    <mo>log</mo>
                    <mi>b</mi>
                  </msub>
                  <msup>
                    <mi>x</mi>
                    <mi>r</mi>
                  </msup>
                  <mo>=</mo>
                  <mi>r</mi>
                  <msub>
                    <mo>log</mo>
                    <mi>b</mi>
                  </msub>
                  <mi>x</mi>
                </mrow>
              </math>
            </div>
          </div>
          <div class="mathrow">
            <div class="mathcolumn">
              <math>
                <mrow>
                  <msub>
                    <mo>log</mo>
                    <mi>b</mi>
                  </msub>
                  <mrow>
                    <mi>x</mi><mi>y</mi>
                  </mrow>
                  <mo>=</mo>
                  <msub>
                    <mo>log</mo>
                    <mi>b</mi>
                  </msub>
                  <mi>x</mi>
                  <mo>+</mo>
                  <msub>
                    <mo>log</mo>
                    <mi>b</mi>
                  </msub>
                  <mi>y</mi>
                </mrow>
              </math>
            </div>
          </div>
          <div class="mathrow">
            <div class="mathcolumn">
              <math>
                <mrow>
                  <msub>
                    <mo>log</mo>
                    <mi>b</mi>
                  </msub>
                  <mfrac>
                    <mi>x</mi>
                    <mi>y</mi>
                  </mfrac>
                  <mo>=</mo>
                  <msub>
                    <mo>log</mo>
                    <mi>b</mi>
                  </msub>
                  <mi>x</mi>
                  <mo>-</mo>
                  <msub>
                    <mo>log</mo>
                    <mi>b</mi>
                  </msub>
                  <mi>y</mi>
                </mrow>
              </math>
            </div>
          </div>
        </fieldset>
        &nbsp;
        <fieldset class="mathfieldset">
          <legend class="mathlegend">ABSOLUTE VALUE</legend>
          <div class="mathrow">
            <div class="mathcolumn">
              <math>
                <mrow>
                  <mrow>
                    <mo>|</mo><mi>a</mi><mo>|</mo>
                  </mrow>
                  <mo>=</mo>
                  <mrow>
                    <mo>{</mo>
                    <mtable>
                      <mtr>
                        <mtd><mi>a</mi></mtd>
                        <mtd>
                          <mtext>, if &nbsp; </mtext>
                          <mi>a</mi>
                          <mo>≥</mo>
                          <mn>0</mn>
                        </mtd>
                      </mtr>
                      <mtr>
                        <mtd>
                          <mo>-</mo><mi>a</mi>
                        </mtd>
                        <mtd>
                          <mtext>, if &nbsp; </mtext>
                          <mi>a</mi>
                          <mo>&lt;</mo>
                          <mn>0</mn>
                        </mtd>
                      </mtr>
                    </mtable>
                  </mrow>
                </mrow>
              </math>
            </div>
          </div> 
          <div class="mathrow">
            <div class="mathcolumn">
              <math>
                <mrow>
                  <mrow>
                    <mo>|</mo><mi>a</mi><mo>|</mo>
                  </mrow>
                  <mo>=</mo>
                  <mrow>
                    <mo>|</mo><mo>-</mo><mi>a</mi><mo>|</mo>
                  </mrow>
                </mrow>
              </math>
            </div>
          </div>
          <div class="mathrow">
            <div class="mathcolumn">
              <math>
                <mrow>
                  <mrow>
                    <mo>|</mo><mi>a</mi><mo>|</mo>
                  </mrow>
                  <mo>≥</mo>
                  <mn>0</mn>
                </mrow>
              </math>
            </div>
          </div>
          <div class="mathrow">
            <div class="mathcolumn">
              <math>
                <mrow>
                  <mrow>
                    <mo>|</mo><mi>a</mi><mi>b</mi><mo>|</mo>
                  </mrow>
                  <mo>=</mo>
                  <mrow>
                    <mo>|</mo><mi>a</mi><mo>|</mo>
                  </mrow>
                  <mrow>
                    <mo>|</mo><mi>b</mi><mo>|</mo>
                  </mrow>
                </mrow>
              </math>
            </div>
          </div>
          <div class="mathrow">
            <div class="mathcolumn">
              <math>
                <mrow>
                  <mrow>
                    <mo>|</mo>
                    <mfrac><mi>a</mi><mi>b</mi></mfrac>
                    <mo>|</mo>
                  </mrow>
                  <mo>=</mo>
                  <mfrac>
                    <mrow><mo>|</mo><mi>a</mi><mo>|</mo></mrow>
                    <mrow><mo>|</mo><mi>b</mi><mo>|</mo></mrow>
                  </mfrac>
                </mrow>
              </math>
            </div>
          </div>
          <div class="mathrow">
            <div class="mathcolumn">
              <math>
                <mrow>
                  <mrow>
                    <mo>|</mo>
                    <mi>a</mi>
                    <mo>+</mo>
                    <mi>b</mi>
                    <mo>|</mo>
                  </mrow>
                  <mo>≤</mo>
                  <mrow>
                    <mo>|</mo><mi>a</mi><mo>|</mo>
                  </mrow>
                  <mo>+</mo>
                  <mrow>
                  <mo>|</mo><mi>b</mi><mo>|</mo>
                  </mrow>
                </mrow>
              </math>
            </div>
          </div>
        </fieldset>
        &nbsp;
        <fieldset class="mathfieldset">
          <legend class="mathlegend">COMPLETING THE SQUARE</legend>
          <div class="mathrow">
            <div class="mathcolumn">
              <math>
                <mrow>
                  <mi>a</mi><msup><mi>x</mi><mn>2</mn></msup>
                  <mo>+</mo>
                  <mi>b</mi><mi>x</mi>
                  <mo>+</mo>
                  <mi>c</mi>
                  <mo>=</mo>
                  <mi>a</mi>
                  <mo>(</mo><mo>…</mo><mo>)</mo><msup><mo>2</mo></msup>
                  <mo>+</mo>
                  <mtext>constant</mtext>
                </mrow>
              </math>

              <math>
                <mtable columnalign="left">
                  <mtr>
                    <mtd><mn>1.</mn></mtd>
                    <mtd><mtext>Divide through by the coefficient </mtext><mi>a</mi><mtext>.</mtext></mtd>
                  </mtr>
                  <mtr>
                    <mtd><mn>2.</mn></mtd>
                    <mtd><mtext>Move the constant term to the other side.</mtext></mtd>
                  </mtr>
                  <mtr>
                    <mtd><mn>3.</mn></mtd>
                    <mtd>
                      <mtext>Take half of the coefficient </mtext>
                      <mfrac><mi>b</mi><mi>a</mi></mfrac>
                      <mtext>, square it, and add to both sides.</mtext>
                    </mtd>
                  </mtr>
                  <mtr>
                    <mtd><mn>4.</mn></mtd>
                    <mtd><mtext>Factor the left side into a perfect square trinomial.</mtext></mtd>
                  </mtr>
                  <mtr>
                    <mtd><mn>5.</mn></mtd>
                    <mtd><mtext>Apply the square root property.</mtext></mtd>
                  </mtr>
                  <mtr>
                    <mtd><mn>6.</mn></mtd>
                    <mtd><mtext>Solve for </mtext><mi>x</mi><mtext>.</mtext></mtd>
                  </mtr>
                </mtable>
              </math>
            </div>
          </div>
        </fieldset>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
//
</script>
