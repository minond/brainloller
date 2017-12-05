module Util exposing (asList)


asList : Maybe (List a) -> List a
asList list =
    Maybe.withDefault [] list
