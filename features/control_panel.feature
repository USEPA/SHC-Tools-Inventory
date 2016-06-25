Feature: Control panel

  Scenario: Press a buton
    Given the sign is unlit
    When I press the button
    Then the sign should light up with

    """
    Please do not press this button again
    """