-- Read more about this program in the official Elm guide:
-- https://guide.elm-lang.org/architecture/user_input/buttons.html

module Main exposing (..)


import Tachyons exposing (classes, tachyons)
import Tachyons.Classes exposing (f1, purple, pointer, b)
import Html exposing (beginnerProgram, div, button, text)
import Html.Events exposing (onClick)


main =
  beginnerProgram { model = 3, view = view, update = update }


-- view model =
--   div [ classes [ f1, purple, pointer, b ] ]
--     [ button [ onClick Decrement ] [ text "-" ]
--     , div [] [ text (toString model) ]
--     , button [ onClick Increment ] [ text "+" ]
--     ]

view model =
  div [ classes [ f1, purple, pointer, b ] ]
      [ tachyons.css
      , text "hi"
      ]


type Msg = Increment | Decrement


update msg model =
  case msg of
    Increment ->
      model + 1

    Decrement ->
      model - 1

